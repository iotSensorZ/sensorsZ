// // components/PdfViewer.tsx
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// interface PdfViewerProps {
//   url: string;
// }

// const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
//   const defaultLayoutPluginInstance = defaultLayoutPlugin();

//   return (
//     <div style={{ height: '750px' }}>
//       <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}>
//         <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
//       </Worker>
//     </div>
//   );
// };

// export default PdfViewer;
