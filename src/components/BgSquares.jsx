// Generates the overlapping squares background pattern from the mockups
const squareDefs = [
  { top: '4%',  left: '3%',  size: 60  },
  { top: '2%',  left: '12%', size: 40  },
  { top: '8%',  right: '5%', size: 70  },
  { top: '6%',  right: '15%',size: 45  },
  { top: '18%', left: '-2%', size: 55  },
  { top: '30%', right: '-3%',size: 65  },
  { top: '50%', left: '2%',  size: 50  },
  { top: '55%', left: '10%', size: 35  },
  { top: '65%', right: '2%', size: 58  },
  { top: '72%', right: '12%',size: 42  },
  { top: '80%', left: '-3%', size: 68  },
  { top: '85%', left: '8%',  size: 38  },
  { top: '88%', right: '3%', size: 55  },
  { top: '92%', right: '18%',size: 32  },
];

export default function BgSquares() {
  return (
    <>
      <div className="bg-pattern" />
      <div className="squares-deco">
        {squareDefs.map((s, i) => (
          <div
            key={i}
            className="sq"
            style={{
              top:    s.top,
              left:   s.left,
              right:  s.right,
              width:  s.size,
              height: s.size,
              opacity: 0.35 + (i % 3) * 0.1,
            }}
          />
        ))}
      </div>
    </>
  );
}