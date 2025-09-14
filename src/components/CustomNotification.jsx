const CustomNotification = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#2d3a5a] text-white p-6 rounded-xl shadow-lg border-2 border-[#ff3b86] w-80 text-center animate-fade-in">
      <p className="mb-4 text-lg font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="bg-[#ff3b86] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#ff1a70] transition-colors"
      >
        Aceptar
      </button>
    </div>
  </div>
);

export default CustomNotification;