# `react-vim`: React Component for Vim Key Bindings

## About

`react-vim` is comprised of a textarea supporting core Vim key bindings and a display of the editor's Vim state. `react-vim` is _not_ web wrapper for the Vim text editor. It _isn't_ intended to support files, scrolling, crash recovery, or advanced editing. It's meant for `<500` word text and to support Vim's core features, namely: motion, insertion, deletion, macros, find/replace, and replacing.

Features are implemented according to the [Vim Docs](https://vimdoc.sourceforge.net/htmldoc/help.html), with notable exceptions mentioned in this README.

## Usage

## Supported

Below is a list of currently supported vim features. Will be updated as features are added.

### Motion

[Vim Motion Docs](https://vimdoc.sourceforge.net/htmldoc/motion.html)

#### Left-Right Motions

-   `h`
-   `l`
-   `0`
-   `^`
-   `$` (acts as down motion in certain cases)
-   `g_` (acts as down motion in certain cases)

#### Up-Down Motions

-   `k`
-   `j`

#### Word Motions

-   `w`
-   `W`
-   `b`
-   `B`
-   `e`
-   `E`
-   `ge`
-   `gE`
