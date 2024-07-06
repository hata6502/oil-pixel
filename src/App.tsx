import {
  DocumentTextIcon,
  PencilSquareIcon,
  PhotoIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  ChangeEventHandler,
  FunctionComponent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import { mibaeFilter } from "./mibaeFilter";

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
  const [converting, setConverting] = useState(false);
  const [mibaeImageURL, setMibaeImageURL] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSelectImageButtonClick = () => {
    if (!imageInputRef.current) {
      throw new Error("imageInputRef.current is null");
    }

    imageInputRef.current.click();
  };

  const handleImageInputChange: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    setConverting(true);
    try {
      const imageFile = event.target.files?.[0];
      if (!imageFile) {
        return;
      }

      const imageDataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            throw new Error("reader.result is not string");
          }
          resolve(reader.result);
        };
        reader.readAsDataURL(imageFile);
      });

      const image = new Image();
      await new Promise((resolve) => {
        image.onload = resolve;
        image.src = imageDataURL;
      });

      for (const mibaeImageDataURL of mibaeFilter(image)) {
        URL.revokeObjectURL(mibaeImageURL);
        const mibaeImageResponse = await fetch(mibaeImageDataURL);
        setMibaeImageURL(URL.createObjectURL(await mibaeImageResponse.blob()));

        await new Promise((resolve) => setTimeout(resolve));
      }
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="bg-white mx-auto max-w-4xl mb-16 px-8">
      <div className="mt-16">
        <h2 className="flex flex-col-reverse items-center gap-4 break-keep break-words font-bold text-5xl md:flex-row">
          油彩
          <wbr />
          ドット絵
          <wbr />
          メーカー
          <img src="favicon.png" className="inline w-24" />
        </h2>

        <p className="mt-8">写真を油彩風のドット絵に変換するアプリです。</p>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          <figure className="order-2 md:order-1">
            <img
              src="https://i.gyazo.com/78f191032afc97154b073410e8f25bc3.jpg"
              alt=""
            />
            <figcaption>原画像</figcaption>
          </figure>

          <figure className="order-1 md:order-2">
            <img
              src="https://i.gyazo.com/34e908f1cf807589bc74e62494042d0b.png"
              alt=""
            />
            <figcaption>油彩ドット絵</figcaption>
          </figure>
        </div>
      </div>

      <div className="mt-16">
        <button
          disabled={converting}
          onClick={handleSelectImageButtonClick}
          className={clsx(
            "w-full flex items-center justify-center gap-x-2 rounded-md bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900",
            !converting && "hover:bg-neutral-800"
          )}
        >
          {converting ? (
            "変換中…"
          ) : (
            <>
              画像を選択
              <PhotoIcon className="h-6 w-6" aria-hidden="true" />
            </>
          )}
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageInputChange}
        />

        {mibaeImageURL && (
          <a download={`油彩ドット絵-${Date.now()}.png`} href={mibaeImageURL}>
            <img alt="変換後の画像" src={mibaeImageURL} className="mt-4" />
          </a>
        )}
      </div>

      <div className="mt-16">
        {mibaeImageURL && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <a
                href="https://premy.hata6502.com/"
                target="_blank"
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 hover:bg-neutral-800"
              >
                premyで手直し
                <PencilSquareIcon className="h-6 w-6" aria-hidden="true" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                  hashtags: "premy",
                  url: "https://oil-pixel.hata6502.com/",
                })}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 hover:bg-neutral-800"
              >
                Xにポスト
                <ShareIcon className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>

            <p className="mt-4">
              #premy
              タグ付きでXにポストすると、このサイトに掲載されることがあります。
            </p>
          </div>
        )}

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
      className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3"
    />
  );
};
