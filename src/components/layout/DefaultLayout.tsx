import Footer from '../footer/Footer';

export default function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen justify-between w-full flex-col">
      <div className="flex flex-row rounded p-2 w-full mb-8 h-full">
        <div className="p-3 m-2 grow rounded">{children}</div>
      </div>

      <div className="w-[100%] h-32px p-1 bg-container text-p flex items-center z-20 fixed bottom-0">
        <Footer />
      </div>
    </div>
  );
}
