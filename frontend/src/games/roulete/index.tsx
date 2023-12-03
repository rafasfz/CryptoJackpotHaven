import { useEffect, useState } from 'react';
import './styles.css'

export function Roulete() {

    const [resultNumber, setResultNumber] = useState<number | null>(null);
    const [degrees, setDegrees] = useState<number>(0);
    const degreesPerSegment = 360 / 37; // Divisão de 360 graus pelas 37 casas da roleta

    useEffect(() => {
        const container = document.querySelector(".roulette-container") as Element;
        container.style.transform = resultNumber !== null ? `rotate(${calculateRotation()}deg)` : `rotate(${degrees}deg)`;
        container.style.transition = 'transform 10s ease-in-out';
    }, [degrees, resultNumber]);

    useEffect(() => {
      spinRoullete();
    })


    function calculateRotation() {
        if (resultNumber !== null) {
            // Se resultNumber estiver definido, calculamos os graus para posicionar esse número no topo
            const rotation = 360 - (resultNumber * degreesPerSegment) + degreesPerSegment / 2;
            return rotation;
        }
        return degrees;
    }

    function spinRoullete() {
        if (resultNumber === null) {
            setDegrees(prevDegrees => {
                const newDegrees = prevDegrees + 50000;
                console.log(newDegrees);
                return newDegrees;
            });
            // Aqui você pode adicionar lógica para definir resultNumber, dependendo do estado da sua aplicação.
        }
    }

    async function spin() {
      setResultNumber(1);
    }

  
    return (
      <div>
        <button id="spin" onClick={spin}>Spin</button>
        <span className="arrow"></span>
        <div className="roulette-container">
            <div className="zero">0</div>
            <div className="thirty-two">32</div>
            <div className="fifteen">15</div>
            <div className="nineteen">19</div>
            <div className="four">4</div>
            <div className="twenty-one">21</div>
            <div className="two">2</div>
            <div className="twenty-five">25</div>
            <div className="seventeen">17</div>
            <div className="thirty-four">34</div>
            <div className="six">6</div>
            <div className="twenty-seven">27</div>
            <div className="thirteen">13</div>
            <div className="thirty-six">36</div>
            <div className="eleven">11</div>
            <div className="thirty">30</div>
            <div className="eight">8</div>
            <div className="twenty-three">23</div>
            <div className="ten">10</div>
            <div className="five">5</div>
            <div className="twenty-four">24</div>
            <div className="sixteen">16</div>
            <div className="thirty-three">33</div>
            <div className="one">1</div>
            <div className="twenty">20</div>
            <div className="fourteen">14</div>
            <div className="thirty-one">31</div>
            <div className="nine">9</div>
            <div className="twenty-two">22</div>
            <div className="eighteen">18</div>
            <div className="twenty-nine">29</div>
            <div className="seven">7</div>
            <div className="twenty-eight">28</div>
            <div className="twelve">12</div>
            <div className="thirty-five">35</div>
            <div className="three">3</div>
            <div className="twenty-six">26</div>

        </div>
      </div>
    )
}

