interface TagInfo {
  id: number;
  name: string;
}

interface TagInfoWithSelected extends TagInfo{
  selected: boolean;
}