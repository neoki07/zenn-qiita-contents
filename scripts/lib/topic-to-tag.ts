const topicToTagMap: { [key: string]: string } = {
  'Qiita CLI': 'QiitaCLI',
}

export function topicToTag(topic: string) {
  return topicToTagMap[topic] ?? topic
}
