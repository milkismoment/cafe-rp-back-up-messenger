function initColorSync() {
    const colorMappings = [
        { input: 'roomBgColor', display: 'roomBgValue', isRoom: true },
        { input: 'bgColor1', display: 'bgValue1' },
        { input: 'textColor1', display: 'textValue1' },
        { input: 'bgColor2', display: 'bgValue2' },
        { input: 'textColor2', display: 'textValue2' }
    ];

    colorMappings.forEach(item => {
        const inputEl = document.getElementById(item.input);
        const displayEl = document.getElementById(item.display);
        
        inputEl.addEventListener('input', () => {
            const color = inputEl.value.toUpperCase();
            displayEl.textContent = color;
            if (item.isRoom) {
                document.getElementById('previewOutput').style.backgroundColor = color;
            }
        });
    });
}

function processDialogue() {
    const rawA = document.getElementById('rawName1').value.trim(); 
    const rawB = document.getElementById('rawName2').value.trim(); 
    const input = document.getElementById('dialogueInput').value;
    if (!rawA || !rawB) { alert("인식 이름을 입력해 주세요."); return; }

    let processed = input
        .replace(/프로필/g, '').replace(/\d{4}\.\d{2}\.\d{2}\./g, '').replace(/\d{2}:\d{2}/g, '')
        .replace(/답글|수정|삭제|활동 정지|작성자|URL 복사/g, '').replace(/\|/g, '');

    const lines = processed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let result = [];
    let currentSpeaker = "";
    let currentMsg = "";

    lines.forEach(line => {
        if (line === rawA || line === rawB) {
            if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
            currentSpeaker = line;
            currentMsg = ""; 
        } else if (currentSpeaker) {
            let cleanLine = line;
            if (cleanLine.startsWith(rawA)) cleanLine = cleanLine.replace(rawA, "").trim();
            if (cleanLine.startsWith(rawB)) cleanLine = cleanLine.replace(rawB, "").trim();
            if (cleanLine) currentMsg += (currentMsg ? "\n" : "") + cleanLine;
        }
    });
    if (currentSpeaker && currentMsg) result.push(`${currentSpeaker}: ${currentMsg.trim()}`);
    document.getElementById('dialogueInput').value = result.join('\n\n');
}

function convertNames() {
    let text = document.getElementById('dialogueInput').value;
    const rawA = document.getElementById('rawName1').value;
    const rawB = document.getElementById('rawName2').value;
    const realA = document.getElementById('realName1').value;
    const realB = document.getElementById('realName2').value;

    const regA = new RegExp(rawA.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    const regB = new RegExp(rawB.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    document.getElementById('dialogueInput').value = text.replace(regA, realA).replace(regB, realB);
}

function generateHtml() {
    const roomBg = document.getElementById('roomBgColor').value;
    const name1 = document.getElementById('realName1').value.trim();
    const img1 = document.getElementById('img1').value.trim() || 'https://via.placeholder.com/40';
    const bg1 = document.getElementById('bgColor1').value;
    const tc1 = document.getElementById('textColor1').value;

    const name2 = document.getElementById('realName2').value.trim();
    const img2 = document.getElementById('img2').value.trim() || 'https://via.placeholder.com/40';
    const bg2 = document.getElementById('bgColor2').value;
    const tc2 = document.getElementById('textColor2').value;

    const text = document.getElementById('dialogueInput').value;

    const htmlBlocks = text.split('\n\n').filter(b => b.includes(':')).map(block => {
        const [name, ...msgParts] = block.split(':');
        const currentName = name.trim();
        const msg = msgParts.join(':').trim();
        const isRight = (currentName === name2);
        
        const alignStyle = isRight ? "flex-direction: row-reverse;" : "flex-direction: row;";
        const bubbleRadius = isRight ? "border-radius: 15px 0px 15px 15px;" : "border-radius: 0px 15px 15px 15px;";

        return `
<div style="display: flex; ${alignStyle} margin-bottom: 20px; align-items: flex-start; font-family: 'Noto Sans KR', sans-serif;">
    <img src="${isRight ? img2 : img1}" style="width: 40px; height: 40px; border-radius: 12px; object-fit: cover; flex-shrink: 0;">
    <div style="display: flex; flex-direction: column; ${isRight ? 'align-items: flex-end;' : 'align-items: flex-start;'} margin: 0 12px;">
        <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px; color: #333;">${currentName}</div>
        <div style="background: ${isRight ? bg2 : bg1}; color: ${isRight ? tc2 : tc1}; padding: 10px 14px; ${bubbleRadius} font-size: 13px; line-height: 1.6; max-width: 280px; text-align: justify; word-break: break-all;">
            ${msg.replace(/\n/g, '<br>')}
        </div>
    </div>
</div>`;
    }).join('\n');

    const finalHtml = `<div style="max-width: 600px; margin: 0 auto; padding: 25px 20px; background-color: ${roomBg};">\n${htmlBlocks}\n</div>`;
    document.getElementById('previewOutput').style.backgroundColor = roomBg;
    document.getElementById('previewOutput').innerHTML = htmlBlocks;
    document.getElementById('htmlCodeOutput').value = finalHtml;
}

document.addEventListener('DOMContentLoaded', () => {
    initColorSync();
    document.getElementById('btnDialogue').onclick = processDialogue;
    document.getElementById('btnConvert').onclick = convertNames;
    document.getElementById('btnHtml').onclick = generateHtml;
    document.getElementById('copyButton').onclick = () => {
        const code = document.getElementById('htmlCodeOutput');
        code.select();
        document.execCommand('copy');
        alert("복사되었습니다!");
    };
});