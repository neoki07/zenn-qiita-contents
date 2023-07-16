---
title: Zenn / Qiitaに投稿する同じ記事を一元管理するためのGitHubリポジトリを作りました
private: true
tags:
  - zenn
  - zenncli
  - qiita
  - github
updated_at: null
id: null
organization_url_name: null
---

## はじめに

ZennとQiitaは、それぞれエンジニアの情報共有の場として人気のあるプラットフォームです。両方のプラットフォームを活用することで、より多くの人に記事を届けられると思います。しかし、同じ記事を両方のプラットフォームに投稿する場合、二重の管理が必要となります。このような二重管理は手間がかかるだけでなく、変更の漏れなどの問題が生じる可能性があります。

このような問題があるため、私が記事投稿を始めた当初は、一つのプラットフォームにだけ投稿するのが良いのかなと考えていました。GitHubリポジトリで記事を管理することに魅力を感じていたため、[Zenn CLI](https://github.com/zenn-dev/zenn-editor/tree/canary/packages/zenn-cli)を使って管理するようにしました。

https://zenn.dev/zenn/articles/zenn-cli-guide

https://github.com/zenn-dev/zenn-editor/tree/canary/packages/zenn-cli

しかし、最近、Qiitaから[Qiita CLI](https://github.com/increments/qiita-cli/)というツールが公開され、Qiitaの記事もGitHubリポジトリで管理することが可能となりました。

https://blog.qiita.com/qiita-cli-beta-release/

https://github.com/increments/qiita-cli/

そこで、Zenn CLIとQiita CLIを組み合わせると、ZennとQiitaの記事を一つのGitHubリポジトリで一元管理することができるのではないかと考え、その仕組みづくりを行いました。次の章で、今回作成した仕組みについて説明していきます。

:::note alert
私は記事の投稿を始めたばかりで、今回は私にとって必要最低限の仕組みしか作っていません。そのため、これまでにたくさんの記事を投稿されている方にとっては不十分な点があると思いますが、あらかじめご了承ください。
:::

## 今回作成した仕組み

私が作成した仕組みの概要は次のとおりです。Zennの記事からQiitaの記事を自動生成することで、できるだけ二重管理を避けるようにしています。

- Zenn / Qiitaの記事を別々のファイルとして管理する
- Zennの記事 → Qiitaの記事に変換するスクリプトを作成する

### Zenn / Qiitaの記事を別々のファイルとして管理する

ZennとQiitaのマークダウン記法には、それぞれに独自の記法があります。そのため、同一の内容であっても、記事を同じファイルで管理することはできません。そこで、別のディレクトリ内に、別ファイルとして管理することにします。

Zennについては、私が調べた限りではルートディレクトリで管理する以外の方法はないようです。一方で、Qiitaについては、少し工夫する必要がありますが、ルートディレクトリ以外で管理することができます。

そこで、以下のように、Zennはルートディレクトリで、Qiitaは`qiita`ディレクトリで管理することにします。

```bash
.
├── articles
│   └── <Zennの記事>
├── images
│   └── <記事内で参照する画像>
├── qiita
│   ├── public
│   │   └── <Qiitaの記事>
│   └── ....
└── ....
```

ただし、これだと二重管理になってしまうので、後述するスクリプトを使って、Zennの記事からQiitaの記事を自動生成できるようにします。

### Zennの記事 → Qiitaの記事に変換するスクリプトを作成する

以下のようなスクリプトを作成します。

```ts
import { readFileSync, writeFileSync } from 'fs'
import yargs from 'yargs'
import { zennMarkdownToQiitaMarkdown } from './lib'

const argv = yargs
  .command(
    '* <inputPath> [outputPath]',
    'convert Zenn markdown to Qiita markdown',
  )
  .positional('inputPath', {
    describe: 'Zenn markdown filepath to convert',
    type: 'string',
    demandOption: true,
  })
  .positional('outputPath', {
    describe: 'Filepath to output Qiita markdown',
    type: 'string',
    demandOption: false,
  })
  .help()
  .alias('help', 'h')
  .parseSync()

const { inputPath, outputPath } = argv

function main() {
  try {
    const inputContent = readFileSync(inputPath, 'utf8')

    // Zennのマークダウン記法をQiitaのマークダウン記法に変換する
    const outputContent = zennMarkdownToQiitaMarkdown(inputContent, outputPath)

    if (outputPath) {
      writeFileSync(outputPath, outputContent, 'utf8')
      console.log(`Output written to ${outputPath}`)
    } else {
      console.log(outputContent)
    }
  } catch (err) {
    console.error('Error processing:', err)
  }
}

main()
```

このスクリプトは、以下のような処理を行います。

- コマンドライン引数として、Zennの記事のファイルパスと、書き出すQiitaの記事のファイルパスを受け取る
- `zennMarkdownToQiitaMarkdown`関数を呼び出し、Zennのマークダウン記法をQiitaのマークダウン記法に変換する

`zennMarkdownToQiitaMarkdown`関数は、次のように実装します。

```ts
import { convertFrontmatter } from './convert-frontmatter'
import { replaceImagePaths } from './replace-image-paths'
import { replaceMessageToNote } from './replace-message-to-note'

export function zennMarkdownToQiitaMarkdown(
  inputContent: string,
  outputPath?: string,
): string {
  const pipeline = [
    convertFrontmatter(outputPath),
    replaceImagePaths,
    replaceMessageToNote,
  ]

  let output = inputContent
  for (const fn of pipeline) {
    output = fn(output)
  }
  return output
}
```

この関数は、次のような変換用の関数を順番に実行します。

- `convertFrontmatter`関数は、マークダウンの`frontmatter`を変換しています。不要な情報の削除や、Qiitaの記法に沿った情報の引き継ぎを行っています。また、`updated_at`や`id`などのQiitaにしかない情報については、引数の`outputPath`で指定したパスに既にファイルが存在する場合は、そのファイルの値を流用します。そうでない場合は、`null`を設定します。

```md: Zennのマークダウンのfrontmatter
---
title: 'Zenn / Qiitaの同じ記事を一元管理するためのGitHubリポジトリを作りました'
emoji: '📝'
type: 'tech'
topics: ['zenn', 'zenncli', 'qiita', 'github']
published: false
---
```

```md: Qiitaのマークダウンのfrontmatter
---
title: Zenn / Qiitaの同じ記事を一元管理するためのGitHubリポジトリを作りました
private: true
tags:
  - zenn
  - zenncli
  - qiita
  - github
updated_at: '2023-07-15T04:45:13+09:00'
id: 93bed87e3a12a805fc36
organization_url_name: null
---
```

- `replaceImagePaths`関数は、[Zennが対応している`/images`ディレクトリ内にある画像を指定する記法](https://zenn.dev/zenn/articles/deploy-github-images)の代わりに、GitHubリポジトリにアップロードした画像パスを指定する記法に変換します。一度GitHubリポジトリに画像をプッシュしないといけませんが、これでQiitaの記事にも同じ画像を使うことができます。

```md
# `/images`ディレクトリ内の画像パスを指定する （Zenn用の指定方法）

![](https://raw.githubusercontent.com/ot07/zenn-qiita-contents/main/images/example-image1.png)
![](https://raw.githubusercontent.com/ot07/zenn-qiita-contents/main/images/example-article-1/image1.png)

# GitHubリポジトリにアップロードした画像パスを指定する （Qiita用の指定方法）

![](https://raw.githubusercontent.com/<owner>/<repo>/<branch>/images/example-image1.png)
![](https://raw.githubusercontent.com/<owner>/<repo>/<branch>/images/example-article-1/image1.png)
```

- `replaceMessageToNote`関数は、Zennの[メッセージ](https://zenn.dev/zenn/articles/deploy-github-images)記法を、Qiitaの[Note - 補足説明](https://qiita.com/Qiita/items/c686397e4a0f4f11683d#note---補足説明)記法に変換します。

:::note
私は記事投稿を始めたばかりなので必要な変換はこれだけでしたが、あらゆる記事に対応するとなると、より多くの変換が必要になります。その場合は、ここに変換用の関数を追加していくことになると思います。
:::

このようなスクリプトを使うことで、Zennの記事からQiitaの記事を自動生成できるようになりました。

これらの仕組みを使うことで、できるだけ二重管理を避けつつ、ZennとQiitaの記事を一つのGitHubリポジトリで一元管理できるようになりました。変更をプッシュすると、両方の記事が自動的に更新されます。

細かい実装は、以下のリポジトリからご覧いただけます。

https://github.com/ot07/zenn-qiita-contents

## さいごに

この記事では、私がZennとQiitaの同じ記事を一つのGitHubリポジトリで一元管理するために行った仕組みづくりを紹介しました。ひとまずは今後もこの仕組みで記事を管理していき、必要に応じて仕組みをアップデートしていきたいと思います（マークダウン記法を変換する部分など）。

ZennとQiitaの記事を一つのGitHubリポジトリで一元管理したいと思ったら、ぜひ参考にしていただけると嬉しいです。

## 参考記事・リンク

https://zenn.dev/zenn/articles/zenn-cli-guide

https://zenn.dev/zenn/articles/markdown-guide

https://github.com/zenn-dev/zenn-editor

https://blog.qiita.com/qiita-cli-beta-release

https://qiita.com/Qiita/items/c686397e4a0f4f11683d

https://github.com/increments/qiita-cli
