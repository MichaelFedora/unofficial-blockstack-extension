import { AppEntry } from '../../../data/app-entry';

export interface AppsStateType {
  apps: AppEntry[];
  recent: AppEntry[];
  pinned: AppEntry[];
  // version: string;
  lastUpdated: number;
  instanceIdentifier: string;
  instanceCreationDate: number;
}
