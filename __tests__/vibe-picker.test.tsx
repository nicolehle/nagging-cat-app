import { fireEvent, render } from "@testing-library/react-native";

import { FavoriteEmojiRow } from "@/src/features/nudges/FavoriteEmojiRow";

describe("FavoriteEmojiRow", () => {
  it("expands with the plus button and collapses after selecting an emoji", async () => {
    const onChange = jest.fn();
    const view = await render(<FavoriteEmojiRow value="📣" onChange={onChange} />);

    expect(view.getByText("📣")).toBeTruthy();
    expect(view.queryByText("☕")).toBeNull();

    fireEvent.press(view.getByText("+"));
    expect(view.getByText("☕")).toBeTruthy();

    fireEvent.press(view.getByText("☕"));
    expect(onChange).toHaveBeenCalledWith("☕");

    await view.rerender(<FavoriteEmojiRow value="☕" onChange={onChange} />);
    expect(view.getByText("☕")).toBeTruthy();
  });
});
