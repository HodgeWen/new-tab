import type { DBSchema } from "idb";

import type { Group, Website } from "@/types/persistence";

export type WebsiteRecord = Website;
export type GroupRecord = Group;

export interface NewTabDBSchema extends DBSchema {
  websites: {
    key: string;
    value: WebsiteRecord;
    indexes: { "by-groupId": string; "by-order": number };
  };
  groups: {
    key: string;
    value: GroupRecord;
    indexes: { "by-order": number };
  };
}
