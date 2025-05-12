import { lintSource } from '@secretlint/core';
import { creator } from '@secretlint/secretlint-rule-preset-recommend';

type MaskSecretsResult = {
  maskedText: string;
  foundSecrets: boolean;
};

async function maskSecrets(text: string): Promise<MaskSecretsResult> {
  if (text === undefined || text === null) {
    throw new Error('入力テキストが無効です');
  }

  // テキストの解析を実行
  const results = await lintSource({
    source: {
      filePath: 'test.md',
      content: text,
      ext: '.txt',
      contentType: 'text',
    },
    options: {
      config: {
        rules: [
          {
            id: '@secretlint/secretlint-rule-preset-recommend',
            rule: creator,
            options: {
              allow: [], // デフォルトの許可リストを無効化
            },
          },
        ],
      },
    },
  });

  let maskedText = text;
  let foundSecrets = false;

  // 検出されたメッセージを逆順にソートして、置換時のインデックスのズレを防ぐ
  const sortedMessages = results.messages.sort((a, b) => {
    return (b.range?.[0] ?? 0) - (a.range?.[0] ?? 0);
  });

  // 見つかった機密情報をマスク
  for (const message of sortedMessages) {
    if (message.range) {
      foundSecrets = true;
      const start = message.range[0];
      const end = message.range[1];
      const secret = text.substring(start, end);
      maskedText = maskedText.replace(
        new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        '********',
      );
    }
  }

  return {
    maskedText,
    foundSecrets,
  };
}

export { maskSecrets, type MaskSecretsResult };
