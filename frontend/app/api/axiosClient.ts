import axios from 'axios';
import { toast } from '@/utils/toast';

// axiosのリクエスト設定に独自のプロパティを追加するための型宣言
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        skipSuccessToast?: boolean; // trueのときは成功トーストを出さない
    }
}

// 同時進行しているAPIリクエストの数を数えるカウンター
let activeRequests = 0;

// ローディングを開始する関数
const startLoading = () => {
    if (activeRequests === 0) {
        window.dispatchEvent(new CustomEvent('global-loading', { detail: true }));
    }
    activeRequests++;
};

// ローディングを終了する関数
const stopLoading = () => {
    activeRequests--;
    if (activeRequests <= 0) {
        activeRequests = 0;
        window.dispatchEvent(new CustomEvent('global-loading', { detail: false }));
    }
};

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエストインターセプター
axiosClient.interceptors.request.use(
    (config) => {
        const isSilentRequest = config.url?.endsWith('/like') || config.url?.endsWith('/bookmark');

        if (!isSilentRequest) {
            startLoading();
        }

        // localStorageからトークンを取得してヘッダーにセット
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        stopLoading();
        return Promise.reject(error);
    }
);

// レスポンスインターセプター
axiosClient.interceptors.response.use(
    (response) => {
        stopLoading();

        // 以下の3条件を全て満たす場合だけ成功トーストを発火する
        // ① GET以外（POST・PATCH・DELETE）のリクエスト
        // ② skipSuccessToast が true でない（いいね系はここでスキップされる）
        // ③ バックエンドのレスポンスに message が存在する
        if (
            response.config.method !== 'get' &&
            !response.config.skipSuccessToast &&
            response.data?.message
        ) {
            toast.success(response.data.message);
        }

        return response;
    },
    (error) => {
        stopLoading();

        let errorMessage = error.response?.data?.message;

        switch (error.response?.status) {
            case 400:
                errorMessage = "リクエストエラーが発生しました。";
                break
            case 401:
                errorMessage = "認証に失敗しました。";
                break
            case 404:
                errorMessage = "対象のデータが見つかりません。";
                break
            case 409:
                errorMessage = "すでに登録されています。";
                break
            case 500:
                errorMessage = "サーバー内部でエラーが発生しました。";
                break
            default:
                errorMessage = "通信エラーが発生しました。";
                break
        }

        toast.error(errorMessage);

        return Promise.reject(error);
    }
);

export default axiosClient;

