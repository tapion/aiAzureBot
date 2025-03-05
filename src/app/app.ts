import { MemoryStorage, MessageFactory, TurnContext } from "botbuilder";
import * as path from "path";
import config from "../config";
import * as customSayCommand  from "./customSayCommand";

// See https://aka.ms/teams-ai-library to learn more about the Teams AI library.
import { AI, Application, ActionPlanner, OpenAIModel, PromptManager, TurnState } from "@microsoft/teams-ai";
import { AzureAISearchDataSource } from "./azureAISearchDataSource";

// Create AI components
const model = new OpenAIModel({
  azureApiKey: config.azureOpenAIKey,
  azureDefaultDeployment: config.azureOpenAIDeploymentName,
  azureEndpoint: config.azureOpenAIEndpoint,

  useSystemMessages: true,
  logRequests: true,
});
const prompts = new PromptManager({
  promptsFolder: path.join(__dirname, "../prompts"),
});
const planner = new ActionPlanner<TurnState>({
  model,
  prompts,
  defaultPrompt: "chat",
});

// Register your data source with planner
planner.prompts.addDataSource(
  // TODO: Cambiar esto con la info de tu Azure Search
  new AzureAISearchDataSource({
    name: "searchchatjuri",
    indexName: "idxaisearchchatjuridicodos",
    azureAISearchApiKey: config.azureSearchKey!,
    azureAISearchEndpoint: config.azureSearchEndpoint!,
    azureOpenAIApiKey: config.azureOpenAIKey!,
    azureOpenAIEndpoint: config.azureOpenAIEndpoint!,
    azureOpenAIEmbeddingDeploymentName: config.azureOpenAIEmbeddingDeploymentName!,
  })
);

// Define storage and application
const storage = new MemoryStorage();
const app = new Application<TurnState>({
  storage,
  ai: {
    planner,
    enable_feedback_loop: true,
  },
});
app.ai.action(AI.SayCommandActionName, customSayCommand.sayCommand(true));

app.feedbackLoop(async (context, state, feedbackLoopData) => {
  //add custom feedback process logic here
  console.log("Your feedback is " + JSON.stringify(context.activity.value));
});

export default app;
