// import { hints, giftHints } from '../data/hints';
import { hints, giftHints } from '../data/hints.jsx';

export function HintsPage({ StaticPage, Footer, goToPage, currentPage }) {
  return (
    <>
      <StaticPage title="Hints" goToPage={goToPage}>
        <div className="hints-list">
          <p>Consult the resources, and open each hint only as needed.</p>

          <section className="map-section" aria-label="Navigation maps">
            {/* <pre className="text-map">{`GROUND FLOOR

[DRAWING ROOM] -- [GREAT HALL] -- [STUDY]
                  /     |      \\
          [ORANGERY] [UPPER LANDING] [SERVANTS' PASSAGE]
              |
          [GARDEN]`}</pre>

            <pre className="text-map">{`UPPER FLOOR

                    [GREAT HALL]
                         |
                  [UPPER LANDING]
                  /      |       \\
        [MUSIC ROOM] [LIBRARY] [SERVANTS' PASSAGE]
                                      |
                                   [ATTIC]`}</pre> */}

            <pre className="text-map">{`WESTMOOR HALL

[DRAWING ROOM] -- [GREAT HALL] -- [STUDY]
                  /     |   \\
          [ORANGERY]    |   [SERVANTS' PASSAGE]
             |          |    /            \\
        [GARDEN]  [UPPER LANDING]        [ATTIC]
                    /        \\             
           [MUSIC ROOM]   [LIBRARY] `}</pre>
          </section>

          <section className="hint-section">
            <h2>Lady Gray’s Poem</h2>

            <blockquote className="poem">
                <p>
                <em>Called souls assemble, names are read,</em><br />
                <em>as white snow crowns the roses red,</em><br />
                <em>the key is turned by trembling hand,</em><br />
                <em>her shadow falls on house and land.</em><br />
                <em>Wake, dear heart, and claim your due:</em><br />
                <em>receive the birthright kept for you.</em><br />
                <em>Estates may pass by trust and deed; but!</em><br />
                <em>nothing’s clear with just one read.</em>
                </p>
            </blockquote>
          </section>

          <details>
            <summary>What should I give to whom?</summary>

            {giftHints.map(hint => (
              <section key={hint.character} className="gift-hint">
                <h3>{hint.character}</h3>

                <ol>
                  {hint.steps.map(step => (
                    <li key={step}>
                      <code>{step}</code>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </details>

          {hints.map(hint => (
            <details key={hint.title}>
              <summary>{hint.title}</summary>

              {hint.lines?.map(line => (
                <p key={line}>
                  <code>{line}</code>
                </p>
              ))}

              {hint.paragraphs?.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </details>
          ))}
        </div>
      </StaticPage>

      <Footer goToPage={goToPage} currentPage={currentPage} />
    </>
  );
}
