export interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

interface TreeNode {
  type: string;
  title: string;
  value: any;
  children: TreeNode[];
}

export default function convertTree(obj: any): DataNode {
  let type;
  let title;
  let value;
  let children;

  title = 'json'

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      value = obj;
      children = traversalArray(obj);
      type = 'array';
    } else {
      value = obj;
      type = 'object';
      children = traversalObj(obj);
    }
  } else {
    console.log(`格式错误：{${typeof obj}}`);
  }

  const result = {
    key: uuid(),
    type: type,
    title: title,
    value: value,
    children: children,
  }

  console.log(`result: ${JSON.stringify(result)}`)

  return {
    key: uuid(),
    title: title,
    children: children,
  };
}

function traversalArray(obj: any[]): DataNode[] {
  let result: DataNode[] = [];
  for (let i = 0; i < obj.length; i++) {
    let title;
    let children;

    const e = obj[i];
    if (typeof e == 'object') {
      children = traversalObj(e);
      title = i.toString();

      result.push({title, children, key: uuid()})
    } else {
      let base = traversalBase(i.toString(), e);
      result.push(base);
    }
  }

  console.log(`array: ${result}`)

  return result;
}

function traversalObj(obj: any): DataNode[] {

  let result: any = [];

  for (let key in obj) {

    let type;
    let title;
    let value;
    let children;

    title = key;
    value = obj[key];

    console.log(`key${key}`)
    let e = obj[key];

    if (typeof e == 'object') {
      if (Array.isArray(e)) {
        type = 'array'
        children = traversalArray(e);
      } else {
        type = 'object'
        children = traversalObj(e);
      }

      result.push({
        type, title, value, children, key: uuid(),
      })
    } else {
      const temp = traversalBase(title, e);
      result.push(temp);
    }
  }

  return result;
}


function traversalBase(title: string, obj: any): DataNode {

  let type = ''
  let value = obj;
  let children: any = [];

  if (obj === null) {
    title = `${title}: null`
  }

  switch (typeof obj) {
    case 'number':
      type = 'number';
      title = `${title}: ${obj}`
      break;
    case 'string':
      type = 'string';
      title = `${title}: "${obj}"`
      break;
    case 'boolean':
      type = 'boolean';
      title = `${title}: ${obj}`
      break;
  }

  return {
    key: uuid(),
    title: title,
    children: []
  };
}

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  // @ts-ignore
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}


