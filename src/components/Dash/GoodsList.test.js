import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import GoodsList from "./GoodsList";

describe("GoodsList Component", () => {
    let exportXLSXMock;

    beforeEach(() => {
        exportXLSXMock = jest.fn(() => Promise.resolve());
    });

    it("renders correctly with goods data", () => {
        const goods = [{ SORT: 1, VENDOR: "TestVendor", PICTURES: [] }];
        render(
            <GoodsList
                goods={goods}
                exportXLSX={exportXLSXMock}
                feed={[]}
                isTollsStat={true}
            />
        );

        expect(screen.getByText("Количество товаров")).toBeInTheDocument();
        expect(screen.getByText("Скачать XLSX")).toBeInTheDocument();
    });

    it("calls exportXLSX only once when button is clicked", async () => {
        const goods = [{ SORT: 1, VENDOR: "TestVendor", PICTURES: [] }];
        render(
            <GoodsList
                goods={goods}
                exportXLSX={exportXLSXMock}
                feed={[]}
                isTollsStat={true}
            />
        );

        const exportButton = screen.getByText("Скачать XLSX");

        // Simulate multiple clicks
        fireEvent.click(exportButton);
        fireEvent.click(exportButton);

        expect(exportXLSXMock).toHaveBeenCalledTimes(1);
    });

    it("disables button during export", async () => {
        const goods = [{ SORT: 1, VENDOR: "TestVendor", PICTURES: [] }];
        render(
            <GoodsList
                goods={goods}
                exportXLSX={exportXLSXMock}
                feed={[]}
                isTollsStat={true}
            />
        );

        const exportButton = screen.getByText("Скачать XLSX");

        // Simulate button click
        fireEvent.click(exportButton);

        // Check that the button is disabled during export
        expect(exportButton).toHaveAttribute("disabled");
        await screen.findByText("Скачивание...");

        // Check if the button is re-enabled after export
        await new Promise((r) => setTimeout(r, 100)); // Simulate async delay
        expect(screen.getByText("Скачать XLSX")).not.toHaveAttribute("disabled");
    });

    it("toggles feed data switch", () => {
        const goods = [{ SORT: 1, VENDOR: "TestVendor", PICTURES: [] }];
        render(
            <GoodsList
                goods={goods}
                exportXLSX={exportXLSXMock}
                feed={[{ VENDOR: "TestVendor", picture: ["image.jpg"] }]}
                isTollsStat={true}
            />
        );

        const switchLabel = screen.getByText("Данные с сайта");
        expect(switchLabel).toBeInTheDocument();

        const toggleSwitch = screen.getByRole("checkbox");
        fireEvent.click(toggleSwitch);

        // The switch changes label to feed data
        expect(screen.getByText("Данные из фида")).toBeInTheDocument();
    });
});
