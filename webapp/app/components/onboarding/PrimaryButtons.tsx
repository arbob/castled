import primaryButton from "./data/primaryButton";

export default function PrimaryButtons({
  stepsToggle,
  btnType,
  doneCount,
  showSteps
}: {
  stepsToggle: () => void;
  btnType: string;
  doneCount: number;
  showSteps: boolean;
}) {
  const countDone = 4 - doneCount;
  return (
    <>
      {primaryButton.map(
        (item) =>
          item.type === btnType && (
            <div
              className="card mb-3 p-3"
              key={item.type}
              onClick={stepsToggle}
              style={{ cursor: "pointer" }}
            >
              <div className="row text-center">
                <div className="col-1 align-self-center">
                  <img src={item.icon} className="card-img-top p-0" />
                </div>
                <div className="col-7 align-self-center pt-1">
                  <h3>{item.title}</h3>
                </div>
                <div className="col-3 align-self-center">
                  <span style={{ color: "#7a73ff" }}>
                    {countDone === 0
                      ? "All Steps Completed"
                      : `${countDone} ${
                          countDone === 1 ? "step" : "steps"
                        } left`}
                  </span>
                </div>
                {!showSteps && <div className="col-1 align-self-center">{">"}</div>}
              </div>
            </div>
          )
      )}
    </>
  );
}