import html from "html-loader!./html1.htm";
import "./css1.css";
import Thing from "./startup1";

export class Main extends Component {
  render() {
    return (
      <div className="A1">
        Hello<article>Foo</article>
      </div>
    );
  }
}

window.Main = Main;
window.Thing = Thing;

window.a = html;
