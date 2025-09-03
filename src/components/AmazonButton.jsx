function AmazonLink({ url, title }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-block
        bg-yellow-400 hover:bg-yellow-500
        text-black font-bold
        py-2 px-4
        rounded-lg
        shadow-md
        transition-colors duration-200
        text-center
        max-w-xs
      "
    >
      <span className="block text-sm">{title}</span>
      <span className="block mt-2 text-black underline font-semibold">Amazonでチェック</span>
    </a>
  )
}

export default function AmazonButton() {
  return (
    <>
      <AmazonLink url="https://amzn.to/4oIH8VV" title="She is Legend / 3rd アルバム「Perfect Smile」" />
      <AmazonLink url="https://amzn.to/47Ws2G7" title="ヘブンバーンズレッド 公式アートワークス Vol.2" />
      <AmazonLink url="https://amzn.to/4g4bEpb" title="ヘブンバーンズレッド 公式ファンアートブック" />
    </>
  );
}