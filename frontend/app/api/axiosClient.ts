import axios from 'axios';

// 🟢 同時進行しているAPIリクエストの数を数えるカウンター
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

// 2. リクエストインターセプター
axiosClient.interceptors.request.use(
    (config) => {
        startLoading();

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

// 3. レンスポンスインターセプター
axiosClient.interceptors.response.use(
    (response) => {
        stopLoading();
        return response;
    },
    (error) => {
        stopLoading();

        // 401エラー（認証切れ）の際の共通処理
        if (error.response?.status === 401) {
            // localStorage.removeItem('token');
            // window.location.href = '/login';
            return Promise.reject(error);
        }

        // 🟢 401以外のエラー（500サーバーエラーなど）を一括で画面に通知する
        const errorMessage = error.response?.data?.error || '通信エラーが発生しました';
        window.dispatchEvent(new CustomEvent('global-error', { detail: errorMessage }));

        return Promise.reject(error);
    }
);

export default axiosClient;