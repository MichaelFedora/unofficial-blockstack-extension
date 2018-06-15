import { AccountStateType } from './account.state';
import { AppsStateType } from './apps.state';
import { RegistrationStateType } from './registration.state';
import { IdentityStateType } from './identity.state';
import { ApiSettingsType } from '../../../settings/default';

export interface StateType {
  account?: AccountStateType;
  apps?: AppsStateType;
  registration?: RegistrationStateType;
  identity?: IdentityStateType;

  sanity: {
    coreApiRunning: boolean,
    coreApiPasswordValid: boolean
  };
  settings: {
    api: ApiSettingsType
  };
};
