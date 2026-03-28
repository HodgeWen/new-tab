export interface Website {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
  groupId: string | null;
}

export interface Group {
  id: string;
  name: string;
  size: number;
  order: number;
  children: string[];
}
