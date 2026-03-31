
interface TestScreenProps {
    width: number
    height: number
}

export default function TestScreen({ width, height }: TestScreenProps) {
    return (
        <div
            className={`w-[${width}px] h-[${height}px] bg-red-600 flex flex-col items-center justify-center text-white`}
        >
            <h1 className="text-6xl font-bold mb-8">Test Website</h1>
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white"></div>
            <p className="mt-8 text-2xl">If you can see this, it works!</p>
        </div>
    )
}
