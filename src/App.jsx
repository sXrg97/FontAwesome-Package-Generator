import "./App.css";
import { useState } from "react";

function App() {
  const [erroredSvgs, setErroredSvgs] = useState([]);
  const [svgs, setSvgs] = useState([]);

  const handleDownload = async (svgUrl) => {
    try {
      const response = await fetch(svgUrl);
      if (!response.ok) {
        throw new Error("SVG not found");
      }

      const svgData = await response.blob();
      const url = URL.createObjectURL(svgData);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${svgUrl.split("/").pop()}.svg`;
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
        handleDownload(svgUrl);
      }, 300 * i);
    });
  };

  const handleTextAreaChange = (e) => {
    setSvgs(e.target.value.split(/\r?\n/));
  };

  return (
    <>
      <div>
        <h1>FontAwesome Package Generator</h1>
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
        <button onClick={handleClick}>Download SVG</button>
        {erroredSvgs.length > 0 && (
          <>
            <span style={{display: "block", marginTop: 13}}>Could not find the following icons:</span>
            <pre>
              {erroredSvgs.map((err) => (
                <span className="svg-error" key={err}>{err}</span>
              ))}
            </pre>
          </>
        )}
      </div>
    </>
  );
}

export default App;
