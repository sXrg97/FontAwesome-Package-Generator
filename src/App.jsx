import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./App.css";
import { useState } from "react";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { Toaster, toast } from "react-hot-toast";


function App() {
  const [erroredSvgs, setErroredSvgs] = useState([]);
  const [svgs, setSvgs] = useState([]);
  const [usePrefix, setUsePrefix] = useState(true);
  const [prependText, setPrependText] = useState("fa-")

  const handleDownload = async (svgUrl, className) => {
    const [prefix] = className.split(" ");
    console.log(prefix);
    try {
      const response = await fetch(svgUrl);
      if (!response.ok) {
        throw new Error("SVG not found");
      }

      const svgData = await response.blob();
      const url = URL.createObjectURL(svgData);

      const a = document.createElement("a");
      a.href = url;
      if (usePrefix) {
        a.download = `${prefix} ${prependText}${svgUrl.split("/").pop()}`;
      } else {
        a.download = `${prependText}${svgUrl.split("/").pop()}`;
      }
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading SVG:", error);
      setErroredSvgs((prevErrors) => [...prevErrors, svgUrl.split("/").pop()]);
    }
  };

  const fetchIconSvg = (iconClassName) => {
    const [prefix, iconName] = iconClassName.split(" ");

    // Check if both the prefix and icon name are present
    if (!prefix || !iconName) {
      console.error("Invalid icon format:", iconClassName);
      return null;
    }

    // Check if the iconName contains more than one space
    const hasMultipleSpaces = iconName.split(" ").length > 1;
    if (hasMultipleSpaces) {
      console.error("Invalid icon name:", iconName);
      return null;
    }

    let variant = "solid";

    if (prefix === "fab") {
      variant = "brands";
    } else if (prefix === "fal") {
      variant = "light";
    } else if (prefix === "far") {
      variant = "regular";
    }

    const url = `https://site-assets.fontawesome.com/releases/v5.15.4/svgs/${variant}/${iconName.replace(
      "fa-",
      ""
    )}.svg`;

    return url;
  };

  const handleClick = () => {
    setErroredSvgs([]);

    // Filter out invalid icon names
    const validSvgs = svgs.filter((className) => {
      const svgUrl = fetchIconSvg(className);
      if (!svgUrl) {
        console.error("SVG not found for:", className);
        setErroredSvgs((prevErroredSvgs) => [...prevErroredSvgs, className]);
        return false;
      }
      return true;
    });

    validSvgs.forEach((className, i) => {
      const svgUrl = fetchIconSvg(className);
      setTimeout(() => {
        handleDownload(svgUrl, className);
      }, 300 * i);
    });
  };

  const handleTextAreaChange = (e) => {
    setSvgs(e.target.value.split(/\r?\n/));
  };

  return (
    <>
      <div>
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
      <div>
        <div className="logo" style={{ textAlign: "center" }}>
          <img
            src={"/public/fontawesome-kit-generator-favicon.svg"}
            width={100}
          />
        </div>
        <h1>FontAwesome Kit Generator</h1>

        <div className="info">
          <span>
            You can use the following REGEx to search globally within your
            project for all the FontAwesome Icons
          </span>
          <pre
            onClick={() => {
              navigator.clipboard.writeText('\\b(fa|fal|fas|fab|far) \\S+">');
              toast.success("Successfully copied to clipboard!");
            }}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            \b(fa|fal|fas|fab|far) \S+&quot;&gt;
            <FontAwesomeIcon icon={faCopy} style={{ marginRight: "5px" }} />
          </pre>
          <pre
            onClick={() => {
              navigator.clipboard.writeText(`content:\\s*["']\\\\f[^"']*["'];`);
              toast.success("Successfully copied to clipboard!");
            }}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            content:\s*[&quot;&apos;]\\f[^&quot;&apos;]*[&quot;&apos;];
            <FontAwesomeIcon icon={faCopy} style={{ marginRight: "5px" }} />
          </pre>
        </div>

        <textarea
          placeholder={
            "Paste your icons below, each on a new line (eg. fab fa-facebook-square)"
          }
          className="text-area"
          rows="20"
          cols="40"
          onChange={handleTextAreaChange}
          onCopy={handleTextAreaChange}
          onPaste={handleTextAreaChange}
          onCut={handleTextAreaChange}
        ></textarea>
        <div style={{ padding: "10px 0" }}>
          <div>
            <label title="Use the prefix in downloaded icon names? (eg. fab )">
              Use prefix?
              <input
                type="checkbox"
                checked={usePrefix}
                onClick={() => {
                  setUsePrefix((prev) => !prev);
                }}
              />
            </label>
          </div>
          <div>
            <label title="Goes between the prefix and the icon name. (default: fa-)">
              Prepend name:
              <input
                type="text"
                value={prependText}
                onChange={(e) => {
                  setPrependText(e.target.value);
                }}
                style={{ marginLeft: "5px" }}
              />
            </label>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button onClick={handleClick}>Download SVGs</button>
        </div>
        {erroredSvgs.length > 0 && (
          <>
            <span style={{ display: "block", marginTop: 13 }}>
              Could not find the following icons:
            </span>
            <pre>
              {erroredSvgs.map((err) => (
                <span className="svg-error" key={err}>
                  {err}
                </span>
              ))}
            </pre>
          </>
        )}
      </div>
    </>
  );
}

export default App;