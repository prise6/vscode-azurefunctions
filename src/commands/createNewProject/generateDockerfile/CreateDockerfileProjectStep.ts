/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ext } from "@microsoft/vscode-azext-serviceconnector";
import { AzureWizardExecuteStep, UserCancelledError, nonNullValue, nonNullValueAndProp } from "@microsoft/vscode-azext-utils";
import { validateFuncCoreToolsInstalled } from "../../../funcCoreTools/validateFuncCoreToolsInstalled";
import { localize } from "../../../localize";
import { cpUtils } from "../../../utils/cpUtils";
import { IDockerfileProjectContext } from "./IDockerfileProjectContext";

export class CreateDockerfileProjectStep extends AzureWizardExecuteStep<IDockerfileProjectContext>{
    public priority: number = 100;

    public async execute(context: IDockerfileProjectContext): Promise<void> {
        const message: string = localize('installFuncTools', 'You must have the Azure Functions Core Tools installed to run this command.');
        if (!await validateFuncCoreToolsInstalled(context, message, nonNullValueAndProp(context.workspaceFolder?.uri, 'fsPath'))) {
            throw new UserCancelledError('validateFuncCoreToolsInstalled');
        }

        await cpUtils.executeCommand(ext.outputChannel, context.projectPath, "func", "init", "--worker-runtime", nonNullValue(context.dockerfileLanguage), "--docker");
    }

    public shouldExecute(): boolean {
        return true;
    }
}
