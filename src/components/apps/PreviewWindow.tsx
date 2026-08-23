import { useEffect, useState, type ReactNode } from 'react';
import { FileText, Download, User, ImageIcon } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';
import { PROFILE } from '../../constants/profile';

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderInline(text: string): ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*'))
            return <em key={i}>{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
            return <code key={i} className="px-1 py-0.5 bg-gray-100 rounded text-[12px] font-mono">{part.slice(1, -1)}</code>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link)
            return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link[1]}</a>;
        return part;
    });
}

function MarkdownView({ raw }: { raw: string }) {
    const lines = raw.split('\n');
    const nodes: ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = (key: string) => {
        if (!listItems.length) return;
        nodes.push(
            <ul key={key} className="list-disc list-inside space-y-1 text-[14px] text-gray-700 my-2 ml-1">
                {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
            </ul>
        );
        listItems = [];
    };

    lines.forEach((line, i) => {
        const key = String(i);
        if (line.startsWith('# ')) {
            flushList(key + 'l');
            nodes.push(<h1 key={key} className="text-[22px] font-bold text-gray-900 mt-2 mb-1">{renderInline(line.slice(2))}</h1>);
        } else if (line.startsWith('## ')) {
            flushList(key + 'l');
            nodes.push(<h2 key={key} className="text-[15px] font-semibold text-gray-800 mt-5 mb-1">{renderInline(line.slice(3))}</h2>);
        } else if (line.startsWith('### ')) {
            flushList(key + 'l');
            nodes.push(<h3 key={key} className="text-[13px] font-semibold text-gray-700 mt-3">{renderInline(line.slice(4))}</h3>);
        } else if (line.startsWith('- ')) {
            listItems.push(line.slice(2));
        } else if (line.trim() === '---') {
            flushList(key + 'l');
            nodes.push(<hr key={key} className="my-4 border-gray-200" />);
        } else if (line.trim() === '') {
            flushList(key + 'l');
        } else {
            flushList(key + 'l');
            nodes.push(<p key={key} className="text-[14px] text-gray-700 leading-relaxed">{renderInline(line)}</p>);
        }
    });
    flushList('end');

    return <div className="space-y-1">{nodes}</div>;
}

// ─── Content panes ────────────────────────────────────────────────────────────

function MdPane({ name }: { name: string }) {
    const [raw, setRaw] = useState<string | null>(null);

    useEffect(() => {
        setRaw(null);
        fetch(`/files/${name}`)
            .then(r => r.text())
            .then(setRaw)
            .catch(() => setRaw('# Could not load file'));
    }, [name]);

    if (!raw)
        return <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>;

    return (
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white custom-scrollbar">
            <MarkdownView raw={raw} />
        </div>
    );
}

function PdfPane({ name }: { name: string }) {
    return (
        <div className="flex-1 bg-gray-200 overflow-hidden">
            <object data={`/files/${name}`} type="application/pdf" className="w-full h-full">
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 text-sm">
                    <FileText size={36} className="text-gray-400" />
                    <p>PDF preview unavailable in this browser.</p>
                    <a
                        href={`/files/${name}`}
                        download
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-full text-gray-700 text-[13px] transition-colors"
                    >
                        <Download size={13} /> Download {name}
                    </a>
                </div>
            </object>
        </div>
    );
}

function ImgPane({ name }: { name: string }) {
    const [broken, setBroken] = useState(false);
    const src = `/files/pictures/${name}`;

    if (broken) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-gray-100 text-gray-400">
                <ImageIcon size={48} className="text-gray-300" />
                <p className="text-[13px]">{name}</p>
                <p className="text-[11px]">Image not yet available</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden p-4">
            <img
                src={src}
                alt={name}
                className="max-w-full max-h-full object-contain rounded shadow-md"
                onError={() => setBroken(true)}
            />
        </div>
    );
}

function VcfPane() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white gap-6">
            <div className="w-72 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-blue-500 to-blue-700" />
                <div className="px-6 pb-6 -mt-8">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-3 border-2 border-white">
                        <User size={28} className="text-blue-600" />
                    </div>
                    <p className="text-[17px] font-semibold text-gray-900">{PROFILE.name}</p>
                    <p className="text-[13px] text-gray-500 mb-4">{PROFILE.title}</p>
                    <p className="text-[13px] text-gray-600">{PROFILE.email}</p>
                </div>
            </div>
            <a
                href="/files/contact.vcf"
                download="aahil-rupsi.vcf"
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[13px] font-medium transition-colors"
            >
                <Download size={13} /> Add to Contacts
            </a>
        </div>
    );
}

// ─── Window ───────────────────────────────────────────────────────────────────

export default function PreviewWindow() {
    const { closeWindow, previewTarget } = useDesktop();

    if (!previewTarget) return null;

    return (
        <DraggableWindow id="preview" resizable minWidth={480} minHeight={360}>
            <MacWindow
                onClose={() => closeWindow('preview')}
                title={previewTarget.name}
                theme="light"
                className="w-full h-full flex flex-col"
                contentClassName="overflow-hidden"
            >
                {previewTarget.kind === 'md'  && <MdPane  name={previewTarget.name} />}
                {previewTarget.kind === 'pdf' && <PdfPane name={previewTarget.name} />}
                {previewTarget.kind === 'vcf' && <VcfPane />}
                {previewTarget.kind === 'img' && <ImgPane name={previewTarget.name} />}
            </MacWindow>
        </DraggableWindow>
    );
}
