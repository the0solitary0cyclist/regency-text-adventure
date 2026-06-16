import { hints } from '../data/hints';

export function HintsPage({ StaticPage, Footer, goToPage }) {
  return (
    <>
      <StaticPage title="Hints" goToPage={goToPage}>
        <div className="hints-list">
          <p>Use these maps first. Then open each hint only as needed.</p>

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

      <Footer goToPage={goToPage} />
    </>
  );
}