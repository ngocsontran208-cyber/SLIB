import React, { useState } from 'react';
import { Input, Button } from '@slib/ui-core';

interface SpineLabelPreviewProps {
    zplContent: string;
    onChange: (val: string) => void;
}

export const SpineLabelPreview: React.FC<SpineLabelPreviewProps> = ({ zplContent, onChange }) => {
    // Giả lập config khổ giấy (mm)
    const [labelWidth, setLabelWidth] = useState(40);
    const [labelHeight, setLabelHeight] = useState(30);
    const [marginTop, setMarginTop] = useState(2);
    const [marginLeft, setMarginLeft] = useState(2);
    
    // Mock data để preview
    const mockData = {
        CallNumber: 'QA76.73 .J38 2021',
        Title: 'Clean Code',
        Barcode: '1000000123'
    };

    return (
        <div className="flex gap-6">
            <div className="w-1/2 space-y-4">
                <h3 className="text-sm font-semibold">ZPL Code</h3>
                <textarea 
                    className="w-full h-40 p-2 border rounded font-mono text-sm"
                    value={zplContent}
                    onChange={(e) => onChange(e.target.value)}
                />
                
                <h3 className="text-sm font-semibold mt-4">Điều chỉnh khổ giấy (mm)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="block mb-1 text-xs text-muted-foreground">Chiều rộng (mm)</label>
                        <Input type="number" value={labelWidth} onChange={e => setLabelWidth(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs text-muted-foreground">Chiều cao (mm)</label>
                        <Input type="number" value={labelHeight} onChange={e => setLabelHeight(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs text-muted-foreground">Lề trên (Margin Top)</label>
                        <Input type="number" value={marginTop} onChange={e => setMarginTop(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs text-muted-foreground">Lề trái (Margin Left)</label>
                        <Input type="number" value={marginLeft} onChange={e => setMarginLeft(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="w-1/2 bg-slate-100 border rounded-lg p-6 flex flex-col items-center">
                <h3 className="text-sm font-semibold mb-6">Preview tĩnh trên Grid</h3>
                
                {/* Scale 1mm = 3px để dễ nhìn */}
                <div 
                    className="bg-white border-2 border-dashed border-slate-300 shadow-sm relative overflow-hidden"
                    style={{ 
                        width: `${labelWidth * 3}px`, 
                        height: `${labelHeight * 3}px` 
                    }}
                >
                    <div 
                        className="absolute text-center w-full flex flex-col justify-center items-center"
                        style={{ 
                            top: `${marginTop * 3}px`,
                            left: `${marginLeft * 3}px`,
                            width: `calc(100% - ${marginLeft * 3}px)`,
                            height: `calc(100% - ${marginTop * 3}px)`
                        }}
                    >
                        <div className="font-bold text-[10px] uppercase">{mockData.CallNumber}</div>
                        <div className="text-[9px] mt-1 line-clamp-1 px-1">{mockData.Title}</div>
                        
                        {/* Giả lập Barcode */}
                        <div className="mt-2 flex flex-col items-center">
                            <div className="h-4 w-20 bg-black" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)' }}></div>
                            <div className="text-[8px] font-mono mt-0.5">{mockData.Barcode}</div>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Mô phỏng 1 nhãn Tomy theo tỷ lệ 1mm = 3px. <br/>
                    Dữ liệu in thực tế sẽ do máy in mã vạch render từ ZPL.
                </p>
            </div>
        </div>
    );
};
