import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SecureChatOpenAI } from "./llm";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

// マスキング処理を組み込んだLLMを作成
// 使い方はChatOpenAIと全く同じ
const llm = new SecureChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
const message = ChatPromptTemplate.fromMessages([
  new SystemMessage("You are a helpful assistant."),
  new HumanMessage("自己紹介をしてください。"),
]);
const chain = message.pipe(llm).pipe(new StringOutputParser());
const result = await chain.invoke({});
console.log(result);
