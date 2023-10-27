import { LitElement, PropertyValueMap, TemplateResult, css, html, nothing, render, svg } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { globalStyles } from "./styles";
import { map } from "lit-html/directives/map.js";
// @ts-ignore
import logoSvg from "./logo.svg";
import { BskyThreadPost, ViewType, loadThread, BskyAuthor, BskyRecord, processText } from "./bsky";
import { RadioButtonGroup, contentLoader, getTimeDifferenceString, renderGallery, renderCard, dom } from "./utils";

@customElement("skystats-app")
class App extends LitElement {
  static styles = [globalStyles];

  constructor() {
    super();
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  async load() {}

  render() {
    return html` <main class="flex flex-col justify-between m-auto max-w-[728px] px-4 h-full">
      <a class="text-2xl flex align-center justify-center text-primary font-bold text-center my-8" href="/"
        ><i class="w-[32px] h-[32px] inline-block fill-primary">${unsafeHTML(logoSvg)}</i><span class="ml-2">Skystats</span></a
      >

      <div class="flex-grow flex flex-col">
        <p>Skystats shows you analytics for your BlueSky account</p>
      </div>
      <div class="text-center text-xs italic my-4 pb-4">
        <a class="text-primary" href="https://skystats.social" target="_blank">Skystats</a>
        is lovingly made by
        <a class="text-primary" href="https://bsky.app/profile/badlogic.bsky.social" target="_blank">Mario Zechner</a><br />
        No data is collected, not even your IP address.<br />
        <a class="text-primary" href="https://github.com/badlogic/skystats" target="_blank">Source code</a>
      </div>
    </main>`;
  }

  defaultAvatar = svg`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="none" data-testid="userAvatarFallback"><circle cx="12" cy="12" r="12" fill="#0070ff"></circle><circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle><path stroke-linecap="round" stroke-linejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path></svg>`;

  recordPartial(author: BskyAuthor, uri: string, record: BskyRecord, isQuote = false) {
    return html`<div class="flex items-center gap-2">
        <a class="flex items-center gap-2" href="https://bsky.app/profile/${author.handle ?? author.did}" target="_blank">
          ${author.avatar ? html`<img class="w-[2em] h-[2em] rounded-full" src="${author.avatar}" />` : this.defaultAvatar}
          <span class="text-primary">${author.displayName ?? author.handle}</span>
        </a>
        <a
          class="text-xs text-primary/75"
          href="https://bsky.app/profile/${author.did}/post/${uri.replace("at://", "").split("/")[2]}"
          target="_blank"
          >${getTimeDifferenceString(record.createdAt)}</a
        >
      </div>
      <div class="${isQuote ? "italic" : ""} mt-1">${unsafeHTML(processText(record))}</div>`;
  }

  postPartial(post: BskyThreadPost, originalUri?: string): HTMLElement {
    let images = post.post.embed?.images ? renderGallery(post.post.embed.images) : undefined;
    if (!images) images = post.post.embed?.media?.images ? renderGallery(post.post.embed.media.images) : undefined;
    let card = post.post.embed?.external ? renderCard(post.post.embed.external) : undefined;

    let quotedPost = post.post.embed?.record;
    if (quotedPost && quotedPost?.$type != "app.bsky.embed.record#viewRecord") quotedPost = quotedPost.record;
    const quotedPostAuthor = quotedPost?.author;
    const quotedPostUri = quotedPost?.uri;
    const quotedPostValue = quotedPost?.value;
    let quotedPostImages = quotedPost?.embeds[0]?.images ? renderGallery(quotedPost.embeds[0].images) : undefined;
    if (!quotedPostImages) quotedPostImages = quotedPost?.embeds[0]?.media?.images ? renderGallery(quotedPost.embeds[0].media.images) : undefined;
    let quotedPostCard = quotedPost?.embeds[0]?.external ? renderCard(quotedPost.embeds[0].external) : undefined;

    const postDom = dom(html`<div>
      <div class="flex flex-col mt-4 post min-w-[280px] ${post.post.uri == originalUri ? "border-r-4 pr-2 border-primary" : ""}">
        ${this.recordPartial(post.post.author, post.post.uri, post.post.record)} ${images ? html`<div class="mt-2">${images}</div>` : nothing}
        ${quotedPost
          ? html`<div class="border border-gray/50 rounded p-4 mt-2">
              ${this.recordPartial(quotedPostAuthor!, quotedPostUri!, quotedPostValue!, true)}
              ${quotedPostImages ? html`<div class="mt-2">${quotedPostImages}</div>` : nothing} ${quotedPostCard ? quotedPostCard : nothing}
            </div>`
          : nothing}
        ${card ? card : nothing}
      </div>
      ${post.replies.length > 0
        ? html`<div class="border-l border-dotted border-gray/50 pl-4">${map(post.replies, (reply) => this.postPartial(reply, originalUri))}</div>`
        : nothing}
    </div>`)[0];

    return postDom;
  }
}
