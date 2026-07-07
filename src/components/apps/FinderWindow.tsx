import { useState, useEffect, type ReactNode } from 'react';
import { FileText, User, Folder, Download } from 'lucide-react';
import MacWindow from '../MacWindow';
import DraggableWindow from '../DraggableWindow';
import { useDesktop } from '../../contexts/DesktopContext';

// ─── Sidebar items ────────────────────────────────────────────────────────────

type ItemKind = 'md' | 'pdf' | 'vcf' | 'folder';

interface FinderItem {
    id: string;
    name: string;
    kind: ItemKind;
}

const ITEMS: FinderItem[] = [
    { id: 'me',      name: 'me.md',         kind: 'md'     },
    { id: 'resume',  name: 'resume.pdf',    kind: 'pdf'    },
    { id: 'contact', name: 'contact.vcf',   kind: 'vcf'    },
    { id: 'source',  name: 'Source Files',  kind: 'folder' },
];

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderInline(text: string): ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*'))
            return <em key={i}>{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
            return <code key={i} className="px-1 py-0.5 bg-black/10 rounded text-[12px] font-mono">{part.slice(1, -1)}</code>;
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch)
            return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{linkMatch[1]}</a>;
        return part;
    });
}

function MarkdownRenderer({ raw }: { raw: string }) {
    const lines = raw.split('\n');
    const nodes: ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
        if (listItems.length === 0) return;
        nodes.push(
            <ul key={`ul-${nodes.length}`} className="list-disc list-inside space-y-1 text-[14px] text-gray-700 my-2">
                {listItems.map((item, i) => (
                    <li key={i}>{renderInline(item)}</li>
                ))}
            </ul>
        );
        listItems = [];
    };

    lines.forEach((line, i) => {
        if (line.startsWith('# ')) {
            flushList();
            nodes.push(<h1 key={i} className="text-[22px] font-bold text-gray-900 mt-2 mb-1">{renderInline(line.slice(2))}</h1>);
        } else if (line.startsWith('## ')) {
            flushList();
            nodes.push(<h2 key={i} className="text-[16px] font-semibold text-gray-800 mt-5 mb-1">{renderInline(line.slice(3))}</h2>);
        } else if (line.startsWith('### ')) {
            flushList();
            nodes.push(<h3 key={i} className="text-[14px] font-semibold text-gray-700 mt-3 mb-0.5">{renderInline(line.slice(4))}</h3>);
        } else if (line.startsWith('- ')) {
            listItems.push(line.slice(2));
        } else if (line.trim() === '---') {
            flushList();
            nodes.push(<hr key={i} className="my-4 border-gray-200" />);
        } else if (line.trim() === '') {
            flushList();
        } else {
            flushList();
            nodes.push(<p key={i} className="text-[14px] text-gray-700 leading-relaxed">{renderInline(line)}</p>);
        }
    });

    flushList();
    return <div className="space-y-1">{nodes}</div>;
}

// ─── Content panes ────────────────────────────────────────────────────────────

function MdPane() {
    const [raw, setRaw] = useState<string | null>(null);

    useEffect(() => {
        fetch('/files/me.md')
            .then(r => r.text())
            .then(setRaw)
            .catch(() => setRaw('# Could not load me.md'));
    }, []);

    if (raw === null)
        return <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading…</div>;

    return (
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-white">
            <MarkdownRenderer raw={raw} />
        </div>
    );
}

function PdfPane() {
    return (
        <div className="flex-1 bg-gray-100 overflow-hidden">
            <object
                data="/files/resume.pdf"
                type="application/pdf"
                className="w-full h-full"
            >
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 text-sm">
                    <FileText size={36} className="text-gray-400" />
                    <p>PDF preview unavailable in this browser.</p>
                    <a
                        href="/files/resume.pdf"
                        download
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 text-[13px] transition-colors"
                    >
                        <Download size={13} /> Download resume.pdf
                    </a>
                </div>
            </object>
        </div>
    );
}

function VcfPane() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white gap-6">
            {/* Card */}
            <div className="w-72 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="h-20 bg-gradient-to-br from-blue-500 to-blue-700" />
                <div className="px-6 pb-6 -mt-8">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-3 border-2 border-white">
                        <User size={28} className="text-blue-600" />
                    </div>
                    <p className="text-[17px] font-semibold text-gray-900">Aahil Rupsi</p>
                    <p className="text-[13px] text-gray-500 mb-4">Software Engineer</p>
                    <div className="space-y-1.5 text-[13px] text-gray-600">
                        <p>aahil@mckinneyandco.com</p>
                    </div>
                </div>
            </div>

            {/* Download */}
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

function FolderPane() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white gap-3 text-center px-8">
            <Folder size={48} className="text-blue-400" />
            <p className="text-[15px] font-medium text-gray-700">Source Files</p>
            <p className="text-[13px] text-gray-400 max-w-xs leading-relaxed">
                Browse the source code for this portfolio on GitHub.
                Links will open once the repo is public.
            </p>
        </div>
    );
}

// ─── Sidebar item icon ────────────────────────────────────────────────────────

function ItemIcon({ kind }: { kind: ItemKind }) {
    if (kind === 'folder') return <Folder size={16} className="text-blue-400 flex-none" />;
    if (kind === 'vcf')    return <User    size={16} className="text-green-600 flex-none" />;
    return <FileText size={16} className={kind === 'pdf' ? 'text-red-500 flex-none' : 'text-blue-600 flex-none'} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FinderWindow() {
    const { closeWindow } = useDesktop();
    const [selected, setSelected] = useState<string>('me');

    const item = ITEMS.find(i => i.id === selected)!;

    const Sidebar = (
        <div className="py-3 select-none">
            <p className="px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Favorites</p>
            {ITEMS.map(it => (
                <button
                    key={it.id}
                    onClick={() => setSelected(it.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 mx-1 rounded-[6px] text-[13px] transition-colors cursor-default text-left ${
                        selected === it.id
                            ? 'bg-[#0062d6] text-white'
                            : 'text-gray-700 hover:bg-black/5'
                    }`}
                    style={{ width: 'calc(100% - 8px)' }}
                >
                    <ItemIcon kind={it.kind} />
                    <span className={selected === it.id ? 'text-white' : ''}>{it.name}</span>
                </button>
            ))}
        </div>
    );

    return (
        <DraggableWindow id="finder" resizable minWidth={540} minHeight={380}>
            <MacWindow
                onClose={() => closeWindow('finder')}
                title={item.name}
                theme="light"
                className="w-full h-full flex flex-col"
                sidebar={Sidebar}
                sidebarClassName="w-48 bg-gray-50 border-r border-gray-200"
                contentClassName="flex flex-col"
            >
                {selected === 'me'      && <MdPane />}
                {selected === 'resume'  && <PdfPane />}
                {selected === 'contact' && <VcfPane />}
                {selected === 'source'  && <FolderPane />}
            </MacWindow>
        </DraggableWindow>
    );
}
