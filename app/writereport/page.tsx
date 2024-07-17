import QuillEditor from '@/components/quill/page';

const WriteReportPage = () => {
  return (
    <div className=" rounded-2xl">
  <div
        className="relative overflow-hidden flex  px-10 py-10 md:p-10 bg-slate-200 text-black">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0">
             Write Your Report
            </h3>
          </div>
          <div>
            <p className="leading-7 text-slate-600 font-semibold">
            Your personal report space
            </p>
          </div>
        </div>
      </div>

      <QuillEditor />
    </div>
  );
};

export default WriteReportPage;
