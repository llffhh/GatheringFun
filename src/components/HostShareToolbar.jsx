import React from 'react';
import { getWhatsAppShareLink, getLineShareLink, generateShareMessage } from '../utils/messaging';

const HostShareToolbar = ({ session, currentUser, messageType }) => {
    const isHost = currentUser?.uid && session?.hostId === currentUser.uid;

    if (!isHost) return null;

    const shareMessage = generateShareMessage(messageType, session);
    const whatsappLink = getWhatsAppShareLink(shareMessage);
    const lineLink = getLineShareLink(shareMessage);

    return (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">
                Host Only: Remind Your Friends
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:scale-[1.02] transition-all shadow-sm"
                >
                    <span className="text-xl">💬</span> WhatsApp
                </a>
                <a
                    href={lineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#06C755] text-white font-bold rounded-xl hover:scale-[1.02] transition-all shadow-sm"
                >
                    <span className="text-xl">🟢</span> LINE
                </a>
            </div>
        </div>
    );
};

export default HostShareToolbar;
