// src/utils/textUtils.ts

/**
 * 要素のテキストが指定した行数を超えてあふれているかを判定します
 * @param element 判定対象のHTML要素
 * @param maxLines 許容する最大行数 (デフォルト: 3)
 * @returns あふれている場合は true、そうでない場合は false
 */
export const checkIsTextOverflowing = (
    element: HTMLElement | null,
    maxLines: number = 3
): boolean => {
    if (!element) return false;

    const computedStyle = window.getComputedStyle(element);

    // 1. 1行の高さ（line-height）を取得。取得できない場合は fontSize * 1.6 で代用
    let lineHeight = parseFloat(computedStyle.lineHeight);
    if (isNaN(lineHeight)) {
        lineHeight = parseFloat(computedStyle.fontSize) * 1.6;
    }

    // 2. Paddingの高さを取得
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);

    // 3. 純粋なテキストコンテンツだけの実際の高さを算出
    const contentHeight = element.scrollHeight - paddingTop - paddingBottom;

    // 4. 許容する高さ（maxLines分）を計算
    const maxAllowedHeight = lineHeight * maxLines;

    // 5. 実際の高さが許容高さを超えているか判定
    return contentHeight > maxAllowedHeight;
};