import {App} from "cdktf";

import AppStack from "./lib/stacks/app";

const app = new App();

new AppStack(app, "main_app");

app.synth();