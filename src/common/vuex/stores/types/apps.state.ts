import { AppEntry } from '../../../app-list';

export interface AppsStateType {
  apps: AppEntry[];
  recent: { name: string, appIcon: { small: string }, launchLink: string }[];
  version: string;
  lastUpdated: number;
  instanceIdentifier: string;
  instanceCreationDate: number;
}
