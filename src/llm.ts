import { maskSecrets } from './mask-secrets';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import type { BaseMessage, MessageContent } from '@langchain/core/messages';
import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai';
import dotenv from 'dotenv';
dotenv.config();

// 別のLLMを使う場合は継承元を変更する
export class SecureChatOpenAI extends ChatOpenAI {
  async #maskMessageContent(
    message: BaseMessage,
  ): Promise<BaseMessage> {
    const content = message.content;

    if (typeof content === 'string') {
      const masked = await maskSecrets(content);
      message.content = masked.maskedText;
      return message;
    }

    if (Array.isArray(content)) {
      const maskedContentParts = await Promise.all(
        content.map(async (part) => {
          if (
            typeof part === 'object' &&
            part !== null &&
            part.type === 'text' &&
            typeof part.text === 'string'
          ) {
            const masked = await maskSecrets(part.text);
            return { ...part, text: masked.maskedText };
          }
          return part;
        }),
      );
      message.content = maskedContentParts as MessageContent;
      return message;
    }
    return message;
  }

  override async _generate(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ) {
    // LLMを呼び出す前に機密情報を秘匿化
    const maskedMessages = await Promise.all(
      messages.map((message) => this.#maskMessageContent(message)),
    );
    return super._generate(maskedMessages, options, runManager);
  }
}
