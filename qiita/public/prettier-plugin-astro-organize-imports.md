---
title: Astroファイルのimport文をフォーマットするPrettierプラグインを作りました
private: false
tags:
  - prettier
  - astro
  - npm
updated_at: '2023-07-16T14:17:20+09:00'
id: 665dd6b781ec6eb49975
organization_url_name: null
---

## はじめに

Astroファイルのimport文をフォーマットするPrettierプラグインを作りました。

普段、TypeScriptファイルなどのimport文をフォマットするために[prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports)というPrettierプラグインを使用しています。Astroファイルに対しても同様の機能がほしいと思ったのがきっかけで作成しました。

https://github.com/ot07/prettier-plugin-astro-organize-imports

https://www.npmjs.com/package/prettier-plugin-astro-organize-imports

このプラグインを使用すると、以下のようにimport文がソートされます。

![](https://raw.githubusercontent.com/ot07/zenn-qiita-contents/main/images/prettier-plugin-astro-organize-imports/demo.gif)

## インストール方法

まずは、依存関係のあるパッケージとともに、プラグインをインストールします。

```shell
npm install -D prettier typescript prettier-plugin-astro-organize-imports
# or
yarn add -D prettier typescript prettier-plugin-astro-organize-imports
# or
pnpm add -D prettier typescript prettier-plugin-astro-organize-imports
```

次に、Prettierの設定ファイルを編集します。ここでは、`.prettierrc`を編集する例を記載します。

```json: .prettierrc
{
  "plugins": ["prettier-plugin-astro-organize-imports"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

Prettierは公式ではAstroファイルをサポートしていないため、`prettier-plugin-astro-organize-imports`が提供する`astro`パーサーを使用するように設定しています。

これでインストールは完了です。Prettierのフォーマットコマンドを実行すると、Astroファイルのimport文がフォーマットされるはずです。

:::note alert
`prettier-plugin-astro`などの他のAstroファイル用プラグインがインストールされている場合、プラグインの自動ロード機能によってエラーが発生する可能性があります。そのような問題を避けるためには、後述の**プラグインの自動ロードを無効にする**設定を行ってください。
:::

## 他のPrettierプラグインとの互換性

他にも、Astroファイルに対して機能するPrettierプラグインとして、以下のものがあります。

- `prettier-plugin-astro`
- `prettier-plugin-tailwindcss`

これらのプラグインと併用する場合には、以下のような設定が必要です。

- `prettier-plugin-astro-organize-imports`を最後に読み込む
- `pluginSearchDirs`オプションを`false`に設定し、プラグインの自動ロードを無効にする

```json: .prettierrc
{
  "plugins": [
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
    "prettier-plugin-astro-organize-imports"
  ],
  "pluginSearchDirs": false,
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

## 参考にしたPrettierプラグイン

#### `prettier-plugin-organize-imports`

`.js`, `.jsx`, `.ts`, `.tsx`, `.vue`ファイルのimport文をフォーマットするプラグインです。import文をフォーマットする処理を実装する上で参考にしました。

https://github.com/simonhaenisch/prettier-plugin-organize-imports

#### `prettier-plugin-tailwindcss`

Tailwind CSS用のプラグインで、クラスをソートするものです。他のPrettierプラグインと互換性を持たせる方法を参考にしました。

https://github.com/tailwindlabs/prettier-plugin-tailwindcss

#### `prettier-plugin-astro`

Astroファイルをフォーマットする公式プラグインです。

https://github.com/withastro/prettier-plugin-astro

## さいごに

Astroファイルのimport文をフォーマットするPrettierプラグインである`prettier-plugin-astro-organize-imports`を紹介しました。

Astroで開発をしている方は、ぜひ試していただけると嬉しいです。

https://github.com/ot07/prettier-plugin-astro-organize-imports
