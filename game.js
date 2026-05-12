/**
 * LoRA Training Simulator Game
 * 以预制菜+专属酱料为主题，SDXL为底模
 */

// ========== 过场动画系统 ==========
const INTRO_SCENES = [
    {
        id: 1,
        text: '昨晚加班到凌晨，打工人犇小九趴在键盘上打瞌睡...',
        duration: 3500
    },
    {
        id: 2,
        text: '突然电脑屏幕发出刺眼的光芒——犇小九被一股神秘力量吸入了屏幕！',
        duration: 3500
    },
    {
        id: 3,
        text: '当犇小九睁开双眼，眼前是一片从未见过的奇幻大陆...',
        duration: 3000
    },
    {
        id: 4,
        text: '一位神秘法师告诉他：在预制菜的基础上熬制专属酱料佐料，才能带回万两黄金重回现实世界！',
        duration: 4500
    },
    {
        id: 5,
        text: '',
        duration: 3000
    }
];

let introState = {
    currentScene: 0,
    autoTimer: null
};

function initIntro() {
    const btnNext = document.getElementById('btn-intro-next');
    const btnSkip = document.getElementById('btn-skip');

    btnNext.addEventListener('click', nextIntroScene);
    btnSkip.addEventListener('click', skipIntro);

    showIntroScene(0);
    spawnParticles();
}

function showIntroScene(index) {
    if (index >= INTRO_SCENES.length) {
        skipIntro();
        return;
    }

    introState.currentScene = index;

    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('scene-' + i);
        if (el) el.style.display = i === (index + 1) ? 'flex' : 'none';
    }

    const scene = INTRO_SCENES[index];
    const textEl = document.getElementById('text-' + (index + 1));
    if (textEl) {
        const p = textEl.querySelector('.narrator');
        if (p && scene.text) {
            p.textContent = '';
            typewriterEffect(p, scene.text, 40);
        }
    }

    const progressBar = document.getElementById('intro-progress-bar');
    progressBar.style.width = ((index + 1) / INTRO_SCENES.length * 100) + '%';

    const btnNext = document.getElementById('btn-intro-next');
    if (index === INTRO_SCENES.length - 1) {
        btnNext.textContent = '开始游戏 🎮';
    } else {
        btnNext.textContent = '继续 →';
    }
}

function nextIntroScene() {
    if (introState.currentScene >= INTRO_SCENES.length - 1) {
        skipIntro();
    } else {
        showIntroScene(introState.currentScene + 1);
    }
}

function skipIntro() {
    if (introState.autoTimer) {
        clearTimeout(introState.autoTimer);
    }
    document.getElementById('intro-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
}

function typewriterEffect(element, text, speed) {
    let i = 0;
    element.textContent = '';
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function spawnParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'pixel-particle';
        p.style.left = (40 + Math.random() * 20) + '%';
        p.style.top = (40 + Math.random() * 20) + '%';
        p.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
        p.style.setProperty('--dy', (Math.random() - 0.5) * 200 + 'px');
        p.style.animationDelay = (Math.random() * 2) + 's';
        p.style.background = ['#ff6b35', '#ffd700', '#4ecdc4', '#6c5ce7'][Math.floor(Math.random() * 4)];
        container.appendChild(p);
    }
}

// ========== 关卡配置 ==========
const LEVELS = [
    {
        id: 1,
        type: "人物LoRA",
        name: "动漫角色训练",
        desc: "训练一个二次元动漫角色LoRA，要求人物特征清晰、泛化能力好",
        requirements: "20张高质量角色图，多角度、多表情\n底模：SDXL (Animagine XL)\n目标：清晰还原角色特征",
        cooking_metaphor: "用新鲜食材熬制一锅经典风味酱料，火候适中，味道均衡",
        ideal: { rank: 16, lr: 0.0005, steps: 2000, images: 20, batch: 4 },
        tolerance: { rank: 8, lr: 0.0003, steps: 800, images: 8, batch: 2 },
        hints: [
            "人物LoRA推荐Rank 16-24，太大容易过拟合",
            "Prodigy优化器下学习率设1，AdamW下0.0005左右",
            "训练步数1000-3000步比较合适",
            "20张左右图片是人物LoRA的甜点数量"
        ]
    },
    {
        id: 2,
        type: "画风LoRA",
        name: "AFK游戏画风",
        desc: "训练AFK游戏画风LoRA，色彩丰富、场景细腻，泛化到各种场景",
        requirements: "40张AFK风格场景图\n底模：SDXL\n目标：学会画风而非具体内容",
        cooking_metaphor: "酿造一瓶风味独特的复合调味酱，要浓郁但不过火",
        ideal: { rank: 32, lr: 0.0003, steps: 2500, images: 40, batch: 4 },
        tolerance: { rank: 12, lr: 0.0002, steps: 1000, images: 10, batch: 2 },
        hints: [
            "画风LoRA需要更高的Rank值(32左右)来学习复杂风格",
            "学习率不宜过高，0.0003左右比较安全",
            "图片数量40张可以覆盖更多风格变化",
            "Batch Size 4-8 根据图片数量调整"
        ]
    },
    {
        id: 3,
        type: "概念LoRA",
        name: "特定服饰元素",
        desc: "训练一个特定服饰/装饰元素的LoRA，可以给各种角色穿戴",
        requirements: "15张目标服饰图片\n底模：SDXL (Pony Diffusion V6)\n目标：服饰可迁移到不同角色",
        cooking_metaphor: "调配一款万能蘸酱，搭配什么菜都好吃",
        ideal: { rank: 24, lr: 0.0004, steps: 1500, images: 15, batch: 4 },
        tolerance: { rank: 8, lr: 0.0003, steps: 600, images: 5, batch: 2 },
        hints: [
            "概念LoRA的Rank推荐20-32之间",
            "学习率适中，0.0003-0.0005",
            "步数不需要太多，1000-2000即可",
            "图片多样性很重要，不同角色穿着同一服饰"
        ]
    },
    {
        id: 4,
        type: "人物LoRA",
        name: "真人写真风格",
        desc: "训练真人写真LoRA，高度还原面部特征，适合真实人像生成",
        requirements: "30张真人照片（多角度/多光线）\n底模：SDXL (ChilloutMix)\n目标：面部高度还原",
        cooking_metaphor: "精心炖制一道功夫汤底，需要文火慢熬才入味",
        ideal: { rank: 16, lr: 0.0003, steps: 3000, images: 30, batch: 8 },
        tolerance: { rank: 8, lr: 0.0002, steps: 1000, images: 10, batch: 3 },
        hints: [
            "真人LoRA的Rank不宜太大，16即可避免过拟合",
            "学习率要偏低，0.0002-0.0004",
            "步数需要更多(2500-3500)来学习细节",
            "30张多角度照片可以提升还原度"
        ]
    },
    {
        id: 5,
        type: "综合挑战",
        name: "过拟合修复挑战",
        desc: "上一次训练的模型过拟合了！请调整参数修复。当前Loss仅0.03，生成图像失真严重",
        requirements: "已有模型过拟合 (Loss: 0.03)\n需要降低过拟合程度\n目标Loss: 0.08-0.12",
        cooking_metaphor: "酱料熬过头了！需要调整配方重新来过",
        ideal: { rank: 12, lr: 0.0002, steps: 1200, images: 25, batch: 4 },
        tolerance: { rank: 4, lr: 0.0002, steps: 500, images: 8, batch: 2 },
        hints: [
            "过拟合了！需要降低Rank值来减小模型容量",
            "降低学习率可以让模型学得更温和",
            "减少训练步数避免学过头",
            "增加图片多样性也能缓解过拟合"
        ]
    }
];

// ========== 游戏状态 ==========
const state = {
    currentLevel: 0,
    totalScore: 0,
    isTraining: false,
    trainingProgress: 0,
    lossHistory: [],
    currentHintIndex: 0
};

// ========== DOM 元素 ==========
const $ = id => document.getElementById(id);
const screens = {
    intro: $('intro-screen'),
    start: $('start-screen'),
    game: $('game-screen'),
    result: $('result-screen'),
    final: $('final-screen')
};

const sliders = {
    rank: $('rank-slider'),
    lr: $('lr-slider'),
    steps: $('steps-slider'),
    images: $('images-slider'),
    batch: $('batch-slider')
};

const displays = {
    rank: $('rank-display'),
    lr: $('lr-display'),
    steps: $('steps-display'),
    images: $('images-display'),
    batch: $('batch-display')
};

// ========== 工具函数 ==========
function lrFromSlider(val) {
    const t = val / 100;
    return 0.0001 * Math.pow(100, t);
}

function lrToSlider(lr) {
    return Math.round(100 * Math.log(lr / 0.0001) / Math.log(100));
}

function formatLR(val) {
    if (val >= 0.001) return val.toFixed(4);
    if (val >= 0.0001) return val.toFixed(5);
    return val.toExponential(2);
}

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}

// ========== 画布绘制 ==========
function drawLossChart(canvas, lossHistory, targetLoss) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, W, H);

    const pad = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    // Title
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Loss 曲线（训练进度）', W / 2, 18);

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.stroke();

    // Y axis labels
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = (0.3 * (4 - i) / 4).toFixed(2);
        const y = pad.top + (chartH * i) / 4;
        ctx.fillText(val, pad.left - 5, y + 4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + chartW, y);
        ctx.stroke();
    }

    // X axis label
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('训练步数 →', W / 2, H - 5);

    if (lossHistory.length < 2) return;

    // Target loss zone
    const targetY = pad.top + chartH * (1 - targetLoss / 0.3);
    ctx.fillStyle = 'rgba(0, 184, 148, 0.1)';
    ctx.fillRect(pad.left, targetY - 10, chartW, 20);
    ctx.strokeStyle = 'rgba(0, 184, 148, 0.6)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.left, targetY);
    ctx.lineTo(pad.left + chartW, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#00b894';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`目标: ${targetLoss.toFixed(2)}`, pad.left + chartW + 2, targetY + 4);

    // Loss curve
    ctx.beginPath();
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    lossHistory.forEach((loss, i) => {
        const x = pad.left + (chartW * i) / (lossHistory.length - 1);
        const y = pad.top + chartH * (1 - loss / 0.3);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
    grad.addColorStop(1, 'rgba(255, 107, 53, 0)');
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Current point
    if (lossHistory.length > 0) {
        const lastI = lossHistory.length - 1;
        const lastLoss = lossHistory[lastI];
        const cx = pad.left + (chartW * lastI) / Math.max(lossHistory.length - 1, 1);
        const cy = pad.top + chartH * (1 - lastLoss / 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b35';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lastLoss.toFixed(4), cx, cy - 12);
    }
}

// ========== 训练模拟算法 ==========
function simulateTraining(params, ideal) {
    const { rank, lr, steps, images, batch } = params;

    // Rank偏差
    const rankDiff = Math.abs(rank - ideal.rank) / ideal.rank;
    const rankFactor = 1 - Math.min(rankDiff, 1) * 0.3;

    // 学习率偏差
    const lrRatio = lr / ideal.lr;
    let lrPenalty = 0;
    if (lrRatio > 5) lrPenalty = 0.5;       // 太高：严重过拟合
    else if (lrRatio > 2) lrPenalty = 0.2;   // 偏高
    else if (lrRatio < 0.2) lrPenalty = 0.4; // 太低：欠拟合
    else if (lrRatio < 0.5) lrPenalty = 0.15;

    // 步数影响
    const stepRatio = steps / ideal.steps;
    let stepPenalty = 0;
    if (stepRatio > 2.5) stepPenalty = 0.4;   // 过度训练
    else if (stepRatio > 1.5) stepPenalty = 0.15;
    else if (stepRatio < 0.3) stepPenalty = 0.4; // 训练不足
    else if (stepRatio < 0.5) stepPenalty = 0.2;

    // 图片数量
    const imgRatio = images / ideal.images;
    let imgFactor = 1;
    if (imgRatio < 0.3) imgFactor = 0.5;
    else if (imgRatio < 0.5) imgFactor = 0.7;
    else if (imgRatio > 2) imgFactor = 0.9;

    // 计算最终Loss
    const baseLoss = 0.25;
    const decay = Math.exp(-steps / (ideal.steps * 1.2));
    const learningEffect = rankFactor * imgFactor * (1 - lrPenalty) * (1 - stepPenalty);
    let finalLoss = baseLoss * decay + 0.02 * (1 - learningEffect);

    // 过拟合检测
    const overfit = (rank > ideal.rank * 2) || (lr > ideal.lr * 4) || (steps > ideal.steps * 2.5);
    if (overfit) {
        finalLoss = Math.max(0.01, finalLoss - 0.05);
    }

    // 欠拟合检测
    const underfit = (rank < ideal.rank * 0.3) || (lr < ideal.lr * 0.1) || (steps < ideal.steps * 0.3);
    if (underfit) {
        finalLoss = Math.min(0.3, finalLoss + 0.08);
    }

    finalLoss = Math.max(0.01, Math.min(0.3, finalLoss));

    // 生成Loss曲线数据
    const numPoints = 50;
    const lossData = [];
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const progress = t * steps;
        const baseCurve = baseLoss * Math.exp(-progress / (ideal.steps * 1.2));
        const noise = (Math.random() - 0.5) * 0.015;
        let point = baseCurve + noise;

        if (overfit && t > 0.6) {
            point -= (t - 0.6) * 0.08;
        }

        point = Math.max(0.01, Math.min(0.3, point));

        // 平滑到最终值
        if (i === numPoints) point = finalLoss;

        lossData.push(point);
    }

    return {
        finalLoss,
        lossData,
        overfit,
        underfit,
        quality: calculateQuality(finalLoss, overfit, underfit)
    };
}

function calculateQuality(loss, overfit, underfit) {
    if (overfit) return { label: '过拟合', color: '#e17055', emoji: '🔥' };
    if (underfit) return { label: '欠拟合', color: '#fdcb6e', emoji: '❄️' };
    if (loss >= 0.07 && loss <= 0.12) return { label: '优秀', color: '#00b894', emoji: '⭐' };
    if (loss >= 0.05 && loss <= 0.15) return { label: '良好', color: '#4ecdc4', emoji: '👍' };
    if (loss < 0.05) return { label: '可能过拟合', color: '#e17055', emoji: '⚠️' };
    return { label: '需优化', color: '#fdcb6e', emoji: '🔧' };
}

// ========== 评分 ==========
function calculateScore(params, ideal, tolerance, result) {
    let score = 0;

    // Rank评分 (25分)
    const rankDist = Math.abs(params.rank - ideal.rank);
    score += Math.max(0, 25 - (rankDist / tolerance.rank) * 25);

    // 学习率评分 (25分)
    const lrDist = Math.abs(Math.log10(params.lr) - Math.log10(ideal.lr));
    score += Math.max(0, 25 - (lrDist / Math.log10(ideal.lr / (ideal.lr - tolerance.lr + 0.00001))) * 8);

    // 步数评分 (25分)
    const stepDist = Math.abs(params.steps - ideal.steps);
    score += Math.max(0, 25 - (stepDist / tolerance.steps) * 25);

    // Loss目标评分 (25分)
    const targetLoss = 0.09;
    const lossDist = Math.abs(result.finalLoss - targetLoss);
    score += Math.max(0, 25 - lossDist * 200);

    return Math.round(Math.max(0, Math.min(100, score)));
}

// ========== 界面更新 ==========
function loadLevel(index) {
    const level = LEVELS[index];
    state.currentLevel = index;
    state.lossHistory = [];
    state.isTraining = false;

    $('round').textContent = index + 1;
    $('task-type').textContent = level.type;
    $('task-desc').textContent = level.desc;
    $('task-requirements').innerHTML = level.requirements.replace(/\n/g, '<br>');

    // Target metrics
    const metrics = $('target-metrics');
    metrics.innerHTML = `
        <div class="target-item">
            <span class="label">目标Loss范围</span>
            <span class="value">0.07 - 0.12</span>
        </div>
        <div class="target-item">
            <span class="label">推荐训练步数</span>
            <span class="value">${level.ideal.steps - 500}~${level.ideal.steps + 500}</span>
        </div>
        <div class="target-item">
            <span class="label">烹饪隐喻</span>
            <span class="value" style="font-size:0.75rem;color:#ddd">${level.cooking_metaphor}</span>
        </div>
    `;

    // Hints
    state.currentHintIndex = 0;
    updateHint(level);

    // Reset sliders
    sliders.rank.value = 16;
    sliders.lr.value = 50;
    sliders.steps.value = 1000;
    sliders.images.value = 20;
    sliders.batch.value = 4;
    updateAllDisplays();

    // Reset visuals
    $('loss-value').textContent = '--';
    $('progress-value').textContent = '0%';
    $('quality-value').textContent = '--';
    $('pot-content').style.height = '0%';
    $('steam').className = 'steam';
    $('fire').className = 'fire';
    $('cooking-status').textContent = '等待开始...';
    $('btn-train').disabled = false;

    // Draw empty chart
    const canvas = $('training-canvas');
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = 220;
    drawLossChart(canvas, [], 0.09);

    showScreen('game');
}

function updateHint(level) {
    const hints = level.hints;
    $('hint-box').innerHTML = `<p>${hints[state.currentHintIndex]}</p>
        <p style="margin-top:8px;font-size:0.75rem;color:#999;">点击查看下一条提示 (${state.currentHintIndex + 1}/${hints.length})</p>`;
}

function updateAllDisplays() {
    displays.rank.textContent = sliders.rank.value;
    displays.lr.textContent = formatLR(lrFromSlider(sliders.lr.value));
    displays.steps.textContent = sliders.steps.value;
    displays.images.textContent = sliders.images.value;
    displays.batch.textContent = sliders.batch.value;
}

function getCurrentParams() {
    return {
        rank: parseInt(sliders.rank.value),
        lr: lrFromSlider(parseInt(sliders.lr.value)),
        steps: parseInt(sliders.steps.value),
        images: parseInt(sliders.images.value),
        batch: parseInt(sliders.batch.value)
    };
}

// ========== 训练动画 ==========
async function runTraining() {
    if (state.isTraining) return;
    state.isTraining = true;
    $('btn-train').disabled = true;

    const level = LEVELS[state.currentLevel];
    const params = getCurrentParams();
    const result = simulateTraining(params, level.ideal);

    // Cooking animation
    $('fire').className = 'fire active';
    $('steam').className = 'steam active';
    $('steam').textContent = '💨💨💨';

    const canvas = $('training-canvas');
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = 220;

    const totalFrames = result.lossData.length;
    let frame = 0;

    const cookingMessages = [
        '投入原料...🥬',
        '开始加热...🔥',
        '酱料开始融合...',
        '风味逐渐浓郁...',
        '精心搅拌中...',
        '调整火候...',
        '香气四溢...',
        '接近完成...',
        '最后调味...',
        '出锅！🍽️'
    ];

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (frame >= totalFrames) {
                clearInterval(interval);
                finishTraining(params, level, result);
                resolve();
                return;
            }

            const currentData = result.lossData.slice(0, frame + 1);
            drawLossChart(canvas, currentData, 0.09);

            const progress = Math.round((frame / totalFrames) * 100);
            $('progress-value').textContent = progress + '%';
            $('loss-value').textContent = result.lossData[frame].toFixed(4);
            $('pot-content').style.height = progress + '%';

            const msgIndex = Math.min(Math.floor(progress / 10), cookingMessages.length - 1);
            $('cooking-status').textContent = cookingMessages[msgIndex];

            // Update pot color based on loss
            const loss = result.lossData[frame];
            if (loss < 0.05) {
                $('pot-content').style.background = 'linear-gradient(180deg, #e17055, #d63031)';
            } else if (loss < 0.15) {
                $('pot-content').style.background = 'linear-gradient(180deg, #00b894, #00cec9)';
            } else {
                $('pot-content').style.background = 'linear-gradient(180deg, #fdcb6e, #f0932b)';
            }

            frame++;
        }, 60);
    });
}

function finishTraining(params, level, result) {
    state.isTraining = false;
    $('fire').className = 'fire';
    $('cooking-status').textContent = '训练完成！';

    const quality = result.quality;
    $('quality-value').textContent = `${quality.emoji} ${quality.label}`;
    $('quality-value').style.color = quality.color;

    const score = calculateScore(params, level.ideal, level.tolerance, result);

    // Show result screen
    setTimeout(() => showResult(params, level, result, score), 800);
}

function showResult(params, level, result, score) {
    const quality = result.quality;

    if (score >= 80) {
        $('result-icon').textContent = '🎉';
        $('result-title').textContent = '训练成功！酱料完美！';
    } else if (score >= 50) {
        $('result-icon').textContent = '👍';
        $('result-title').textContent = '还不错，但可以更好';
    } else {
        $('result-icon').textContent = '🔧';
        $('result-title').textContent = '需要调整参数重来';
    }

    $('result-details').innerHTML = `
        <div><strong>你的参数：</strong></div>
        <div>Rank: ${params.rank} | 推荐: ${level.ideal.rank}</div>
        <div>学习率: ${formatLR(params.lr)} | 推荐: ${formatLR(level.ideal.lr)}</div>
        <div>步数: ${params.steps} | 推荐: ${level.ideal.steps}</div>
        <div>图片数: ${params.images} | 推荐: ${level.ideal.images}</div>
        <div>Batch: ${params.batch} | 推荐: ${level.ideal.batch}</div>
        <div style="margin-top:8px"><strong>最终Loss:</strong> ${result.finalLoss.toFixed(4)}</div>
        <div><strong>质量评估:</strong> ${quality.emoji} ${quality.label}</div>
    `;

    $('round-score').textContent = score;
    $('round-score').classList.add('score-animate');
    setTimeout(() => $('round-score').classList.remove('score-animate'), 600);

    state.totalScore += score;
    $('score').textContent = state.totalScore;

    // Feedback
    const feedback = generateFeedback(params, level.ideal, result);
    $('result-feedback').innerHTML = feedback;

    // Button text
    if (state.currentLevel < LEVELS.length - 1) {
        $('btn-next').textContent = '下一关 →';
    } else {
        $('btn-next').textContent = '查看最终成绩';
    }

    showScreen('result');
}

function generateFeedback(params, ideal, result) {
    const tips = [];

    if (params.rank > ideal.rank * 1.5) {
        tips.push('🔢 <strong>Rank偏高</strong>：Rank太大会增加过拟合风险，且模型文件会变大。就像酱料太浓，会掩盖食材本味。');
    } else if (params.rank < ideal.rank * 0.5) {
        tips.push('🔢 <strong>Rank偏低</strong>：Rank太小学不到足够特征。就像酱料太淡，没什么味道。');
    } else {
        tips.push('🔢 <strong>Rank设置合理</strong>。');
    }

    const lrRatio = params.lr / ideal.lr;
    if (lrRatio > 3) {
        tips.push('📈 <strong>学习率过高</strong>：学得太快容易"学歪了"。就像大火猛烧，容易糊锅。');
    } else if (lrRatio < 0.3) {
        tips.push('📈 <strong>学习率过低</strong>：学得太慢效率低，可能学不充分。就像小火慢炖太久，味道出不来。');
    } else {
        tips.push('📈 <strong>学习率合适</strong>。');
    }

    const stepRatio = params.steps / ideal.steps;
    if (stepRatio > 2) {
        tips.push('🔄 <strong>步数过多</strong>：训练过久容易过拟合。就像酱料熬太久变苦了。');
    } else if (stepRatio < 0.5) {
        tips.push('🔄 <strong>步数过少</strong>：训练不充分，效果打折扣。就像酱料还没入味就起锅了。');
    } else {
        tips.push('🔄 <strong>步数设置合理</strong>。');
    }

    if (result.overfit) {
        tips.push('⚠️ <strong>检测到过拟合</strong>：模型记住了训练图而非学到特征。建议降低Rank、减少步数或增加数据多样性。');
    }
    if (result.underfit) {
        tips.push('⚠️ <strong>检测到欠拟合</strong>：模型还没学到足够特征。建议增加步数、适当提高学习率或增加Rank。');
    }

    return tips.join('<br><br>');
}

function showFinal() {
    $('final-score').textContent = state.totalScore;

    let grade, gradeClass, summary;
    if (state.totalScore >= 450) {
        grade = 'S 级 - 酱料大师！';
        gradeClass = 'grade-s';
        summary = '你对LoRA训练参数有着精湛的理解！从Rank到学习率，从步数到数据集，每个参数都调配得恰到好处。你已经掌握了"预制菜+专属酱料"的秘诀！';
    } else if (state.totalScore >= 350) {
        grade = 'A 级 - 资深厨师';
        gradeClass = 'grade-a';
        summary = '你对LoRA训练有很好的直觉！大部分参数都选得不错，继续练习可以进一步提升。就像一位经验丰富的厨师，偶尔需要微调配方。';
    } else if (state.totalScore >= 200) {
        grade = 'B 级 - 进阶学徒';
        gradeClass = 'grade-b';
        summary = '你已经理解了LoRA训练的基本原理，但参数调配还需要更多练习。记住：Rank控制容量（酱料浓度），学习率控制速度（火候），步数控制训练时长（熬制时间）。';
    } else {
        grade = 'C 级 - 新手入门';
        gradeClass = 'grade-c';
        summary = '不要灰心！LoRA训练参数调整是需要经验积累的。建议重新阅读每关的提示，理解每个参数的作用。就像学做菜一样，多练几次就能掌握火候了！';
    }

    $('final-grade').textContent = grade;
    $('final-grade').className = `final-grade ${gradeClass}`;
    $('final-summary').innerHTML = `
        <p>${summary}</p>
        <br>
        <p><strong>核心知识回顾：</strong></p>
        <p>底模 = 预制菜基底（推荐SDXL系列）</p>
        <p>Rank 16-32 = 酱料浓度适中</p>
        <p>学习率 0.0003-0.0005 = 中火慢炖</p>
        <p>步数 1000-3000 = 充分但不过度熬制</p>
        <p>目标Loss 0.07-0.12 = 风味恰到好处</p>
    `;

    showScreen('final');
}

// ========== 事件绑定 ==========
function init() {
    initIntro();

    $('btn-start').addEventListener('click', () => {
        state.totalScore = 0;
        state.currentLevel = 0;
        $('score').textContent = '0';
        loadLevel(0);
    });

    $('btn-train').addEventListener('click', runTraining);

    $('btn-reset').addEventListener('click', () => {
        if (state.isTraining) return;
        const level = LEVELS[state.currentLevel];
        sliders.rank.value = 16;
        sliders.lr.value = 50;
        sliders.steps.value = 1000;
        sliders.images.value = 20;
        sliders.batch.value = 4;
        updateAllDisplays();
        $('loss-value').textContent = '--';
        $('progress-value').textContent = '0%';
        $('quality-value').textContent = '--';
        $('pot-content').style.height = '0%';
        $('cooking-status').textContent = '等待开始...';
        $('btn-train').disabled = false;

        const canvas = $('training-canvas');
        drawLossChart(canvas, [], 0.09);
    });

    $('btn-next').addEventListener('click', () => {
        if (state.currentLevel < LEVELS.length - 1) {
            loadLevel(state.currentLevel + 1);
        } else {
            showFinal();
        }
    });

    $('btn-restart').addEventListener('click', () => {
        state.totalScore = 0;
        state.currentLevel = 0;
        $('score').textContent = '0';
        loadLevel(0);
    });

    // Slider updates
    Object.entries(sliders).forEach(([key, slider]) => {
        slider.addEventListener('input', updateAllDisplays);
    });

    // Hint cycling
    $('hint-box').addEventListener('click', () => {
        const level = LEVELS[state.currentLevel];
        state.currentHintIndex = (state.currentHintIndex + 1) % level.hints.length;
        updateHint(level);
    });

    // Canvas resize
    window.addEventListener('resize', () => {
        const canvas = $('training-canvas');
        if (canvas && state.lossHistory.length > 0) {
            canvas.width = canvas.offsetWidth || 400;
            canvas.height = 220;
            drawLossChart(canvas, state.lossHistory, 0.09);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
