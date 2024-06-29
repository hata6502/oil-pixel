import { DocumentTextIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { FunctionComponent, Suspense, useEffect, useRef } from "react";

const faqs = [
  {
    title: "premyお絵かきアプリ",
    url: "https://premy.hata6502.com/",
  },
  {
    title: "mibae filter開発風景",
    url: "https://scrapbox.io/hata6502/mibae_filter",
  },
];

const tweetIDsURL =
  "https://script.google.com/macros/s/AKfycbx1Lec0RXfLou1Ixz3-hg6lFHoQdkTDSCFhtYIwQ9_OyWx36f3JYIxGdia9kLdx4DYe/exec";

export const App: FunctionComponent = () => {
  return (
    <div className="bg-white mx-auto max-w-4xl mb-16 px-8">
      <div className="mt-16">
        <h2 className="flex items-center gap-x-2 text-5xl font-bold">
          油彩ドット絵メーカー
          <img src="favicon.png" className="inline w-24" />
        </h2>

        <p className="mt-8">写真を油彩風のドット絵に変換するアプリです。</p>

        <div className="mt-8 grid grid-cols-1 gap-2 md:grid-cols-2">
          <img
            src="https://i.gyazo.com/78f191032afc97154b073410e8f25bc3.jpg"
            alt="原画像"
          />

          <img
            src="https://i.gyazo.com/34e908f1cf807589bc74e62494042d0b.png"
            alt="変換後の画像"
          />
        </div>

        <div className="mt-16">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-x-2 rounded-md bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            画像を選択
            <PhotoIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-16">
        <Suspense>
          <Tweets />
        </Suspense>
      </div>

      <div className="mt-16">
        <div className="divide-y divide-gray-900/10">
          {faqs.map(({ title, url }) => (
            <a
              key={title}
              href={url}
              target="_blank"
              className="flex items-center gap-x-2 py-6"
            >
              <DocumentTextIcon className="h-6 w-6" aria-hidden="true" />
              <span className="font-semibold leading-7">{title}</span>
            </a>
          ))}
        </div>
      </div>

      <footer className="mt-16">
        <p className="text-xs leading-5 text-gray-500">
          {new Date().getFullYear()}
          &nbsp;
          <a
            href="https://twitter.com/hata6502"
            target="_blank"
            className="hover:text-gray-600"
          >
            ムギュウ
          </a>
          &emsp;
          <a
            href="https://scrapbox.io/hata6502/premy%E5%85%8D%E8%B2%AC%E4%BA%8B%E9%A0%85"
            target="_blank"
            className="hover:text-gray-600"
          >
            免責事項
          </a>
        </p>
      </footer>
    </div>
  );
};

let tweetIDs: string[] | undefined;
const Tweets: FunctionComponent = () => {
  if (!tweetIDs) {
    throw (async () => {
      try {
        const tweetIDsResponse = await fetch(tweetIDsURL);
        if (!tweetIDsResponse.ok) {
          throw new Error(tweetIDsResponse.statusText);
        }
        tweetIDs = await tweetIDsResponse.json();
      } catch (exception) {
        console.error(exception);
        tweetIDs = [];
      }
    })();
  }

  const tweetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tweetContainerRef.current || !tweetIDs) {
      return;
    }
    const tweetContainerElement = tweetContainerRef.current;

    for (const tweetID of tweetIDs) {
      const tweetElement = document.createElement("div");
      // @ts-expect-error
      twttr.widgets.createTweet(tweetID, tweetElement);

      tweetContainerElement.append(tweetElement);
    }
  }, []);

  return (
    <div
      ref={tweetContainerRef}
      className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3"
    />
  );
};
