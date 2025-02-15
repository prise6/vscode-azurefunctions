/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardExecuteStep } from '@microsoft/vscode-azext-utils';
import { type Progress } from 'vscode';
import { setLocalAppSetting } from '../../../funcConfig/local.settings';
import { localize } from '../../../localize';
import { type IBindingSetting } from '../../../templates/IBindingTemplate';
import { nonNullProp } from '../../../utils/nonNull';
import { setBindingSetting } from '../../createFunction/IFunctionWizardContext';
import { type IBindingWizardContext } from '../IBindingWizardContext';

export interface IConnection {
    name: string;
    connectionString: string;
}

export abstract class AzureConnectionCreateStepBase<T extends IBindingWizardContext> extends AzureWizardExecuteStep<T> {
    public priority: number = 200;

    private readonly _setting: IBindingSetting;

    constructor(setting: IBindingSetting) {
        super();
        this._setting = setting;
    }

    public abstract getConnection(context: T): Promise<IConnection>;

    public async execute(context: T, progress: Progress<{ message?: string | undefined; increment?: number | undefined }>): Promise<void> {
        progress.report({ message: localize('retrieving', 'Retrieving connection string...') });

        const result: IConnection = await this.getConnection(context);
        let appSettingKey: string = `${result.name}_${nonNullProp(this._setting, 'resourceType').toUpperCase()}`;
        appSettingKey = appSettingKey.replace(/[^a-z0-9_\.]/gi, ''); // remove invalid chars
        setBindingSetting(context, this._setting, appSettingKey);
        await setLocalAppSetting(context, context.projectPath, appSettingKey, result.connectionString);
    }
}
