import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Label, Tooltip } from 'recharts';
import { calcAttackEffectSize, calcBuffEffectSize, calcDebuffEffectSize } from './logic'


export function AttackLineChart({ attackInfo, status, enemyStat, enemyStatDown, jewelLv, skillLv }) {
    const data1 = [];
    const data2 = [];
    const skillStat = attackInfo.param_limit;
    const minPower = attackInfo.min_power * (1 + 0.05 * (skillLv - 1));
    const maxPower = attackInfo.max_power * (1 + 0.02 * (skillLv - 1));
    const tickMinPower = Math.floor(minPower + attackInfo.min_power * (jewelLv * 0.02));
    const tickMaxPower = Math.floor(maxPower + attackInfo.max_power * (jewelLv * 0.02));

    let min = Math.max(Math.min(status, enemyStat) - 80, 0);
    let max = Math.max(status, enemyStat + skillStat + 100) + 50;
    for (let x = min; x <= max; x++) {
        data1.push({ x: x, y: calcAttackEffectSize(attackInfo, x, enemyStat - enemyStatDown, skillLv, jewelLv) });
    }
    for (let x = min; x <= max; x++) {
        data2.push({ x: x, y: calcAttackEffectSize(attackInfo, x, enemyStat - Math.max(enemyStatDown, 50), skillLv, jewelLv) });
    }

    return (
        <LineChart width={380} height={300} data={data1} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" domain={['dataMin', 'dataMax']} interval={49} tick={{ fontSize: 12, angle: -45, textAnchor: 'end', }}>
                <Label value="ステータス" offset={40} position="insideBottom" />
            </XAxis>
            <YAxis domain={[0, tickMaxPower * 1.1]} ticks={[tickMinPower, tickMaxPower]}
                tickFormatter={(value) => value.toLocaleString()} width={40} tick={{ fontSize: 12, angle: -45, textAnchor: 'end', }}>
                <Label value="攻撃力" offset={50} angle={-90} position="insideLeft" />
            </YAxis>
            <Tooltip content={<CustomTooltip2 />} />
            <Line type="monotone" dataKey="y" stroke="#3399ff" strokeWidth={2} dot={false} name="クリティカル" data={data2} />
            <Line type="monotone" dataKey="y" stroke="#ff3333" strokeWidth={2} dot={false} name="通常ダメージ" />
            <ReferenceLine x={status} stroke="deepskyblue" strokeWidth={2}>
                <Label value={status} position="top" fill="black" fontSize={20} angle={-90} offset={-20} />
            </ReferenceLine>
        </LineChart>
    );
}

const CustomTooltip2 = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const point = payload[0].payload; // データ全体
        return (
            <div style={{ backgroundColor: '#fff', padding: 10, border: '1px solid #ccc' }}>
                <p><strong>{point.x}:</strong></p>
                {payload.map((item, index) => (
                    <p key={index} style={{ color: item.stroke }}>
                        {item.name}: {item.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function BuffLineChart({ buffInfo, status, jewelLv, skillLv }) {
    const data = [];
    const skillStat = buffInfo.param_limit;
    const minPower = buffInfo.min_power * (1 + 0.03 * (skillLv - 1));
    const maxPower = buffInfo.max_power * (1 + 0.02 * (skillLv - 1));
    const tickMinPower = Math.floor(minPower + buffInfo.min_power * (jewelLv * 0.04));
    const tickMaxPower = Math.floor(maxPower + buffInfo.max_power * (jewelLv * 0.04));

    let min = 0;
    let max = Math.max(status, skillStat + 300) + 30;
    for (let x = min; x <= max; x++) {
        data.push({ x: x, y: calcBuffEffectSize(buffInfo, x, skillLv, jewelLv) });
    }

    return (
        <LineChart width={380} height={300} data={data} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" domain={['dataMin', 'dataMax']} interval={49} tick={{ fontSize: 12, angle: -45, textAnchor: 'end', }}>
                <Label value="ステータス" offset={40} position="insideBottom" />
            </XAxis>
            <YAxis domain={[tickMinPower * 0.9, tickMaxPower * 1.1]} ticks={[tickMinPower, tickMaxPower]}
                tickFormatter={(value) => `${value}%`} width={40} >
                <Label value="効果量" offset={50} angle={-90} position="insideLeft" />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="y" stroke="#ff3333" strokeWidth={2} dot={false} />

            <ReferenceLine x={status} stroke="deepskyblue" strokeWidth={2}>
                <Label value={status} position="top" fill="black" fontSize={20} angle={-90} offset={-20} />
            </ReferenceLine>
        </LineChart>
    );
}

export function DebuffLineChart({ buffInfo, status, enemyStat, jewelLv, skillLv }) {
    const data = [];
    const skillStat = buffInfo.param_limit;
    const minPower = buffInfo.min_power * (1 + 0.05 * (skillLv - 1));
    const maxPower = buffInfo.max_power * (1 + 0.02 * (skillLv - 1));
    const tickMinPower = Math.floor(minPower + buffInfo.min_power * (jewelLv * 0.02));
    const tickMaxPower = Math.floor(maxPower + buffInfo.max_power * (jewelLv * 0.02));

    let min = Math.min(status, enemyStat) - 30;
    let max = Math.max(status, enemyStat + skillStat + 100) + 30;
    for (let x = min; x <= max; x++) {
        data.push({ x: x, y: calcDebuffEffectSize(buffInfo, x, enemyStat, skillLv, jewelLv) });
    }

    return (
        <LineChart width={380} height={300} data={data} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" domain={['dataMin', 'dataMax']} interval={49} tick={{ fontSize: 12, angle: -45, textAnchor: 'end', }}>
                <Label value="ステータス" offset={40} position="insideBottom" />
            </XAxis>
            <YAxis domain={[tickMinPower * 0.9, tickMaxPower * 1.1]} ticks={[tickMinPower, tickMaxPower]}
                tickFormatter={(value) => `${value}%`} width={40} >
                <Label value="効果量" offset={50} angle={-90} position="insideLeft" />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="y" stroke="#ff3333" strokeWidth={2} dot={false} />

            <ReferenceLine x={status} stroke="deepskyblue" strokeWidth={2}>
                <Label value={status} position="top" fill="black" fontSize={20} angle={-90} offset={-20} />
            </ReferenceLine>
        </LineChart>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const point = payload[0].payload; // データ全体
        return (
            <div style={{ backgroundColor: '#fff', padding: 10, border: '1px solid #ccc' }}>
                <p><strong>{point.x}:</strong> {`${Math.floor(point.y * 100) / 100}%`}</p>
                {/* 必要に応じて他のフィールドや条件分岐も追加可能 */}
            </div>
        );
    }

    return null;
};