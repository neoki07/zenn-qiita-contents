---
title: Zenn / Qiitaの同じ記事を統合管理するためのGitHubリポジトリを作りました
tags:
  - Qiita
  - GitHub
  - Zenn
  - ZennCLI
private: true
updated_at: '2023-07-15T15:16:03+09:00'
id: 93bed87e3a12a805fc36
organization_url_name: null
---

# はじめに

ZennとQiitaは、それぞれエンジニアの情報共有の場として人気のあるプラットフォームです。両方のプラットフォームを活用することで、より多くの人に記事を届けられると思います。しかし、同じ記事を両方のプラットフォームに投稿する場合、二重の管理が必要となります。このような二重管理は手間がかかり、変更の漏れなどの問題が生じる可能性があります。

このような問題があるため、私が記事投稿を始めた当初は一つのプラットフォームにだけ投稿することにしていました。しかし、最近、Qiitaから[Qiita CLI](https://github.com/increments/qiita-cli/)というツールが公開され、GitHubリポジトリでQiitaの記事を管理することが可能となりました。

[^1]: Zennには、元々GitHubリポジトリで記事を管理する機能が備わっています。

https://blog.qiita.com/qiita-cli-beta-release/

https://github.com/increments/qiita-cli/

このツールの登場により、ZennとQiitaの記事を一つのGitHubリポジトリで統合的に管理することができるのではないかと考え[^1]、その仕組みづくりを考えることにしました。次の章で、その仕組みについて詳しく説明します。
