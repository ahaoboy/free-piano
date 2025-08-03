export type Item = {
  "link": string,
  "title": string
  id: number
}

export function getData(): Promise<Item[]> {
  return fetch('https://raw.githubusercontent.com/ahaoboy/free-piano-cdn/main/assets/urls.json').then(i => i.json())
}

export function getItem(id: string | number) {
  return fetch(`https://raw.githubusercontent.com/ahaoboy/free-piano-cdn/main/assets/pages/${id}.html`).then(i => i.text())
}