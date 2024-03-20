import gameInfo from '../../dummy-data/game-info.json';
import { BuyInfo } from '../../type/types';

interface BuyReceiptProps {
    buyableInfoList: BuyInfo[];
    maximumBuyable: number;
    buyProduct: (a: number) => void;
}

export default function TradeBuyReceipt({
    buyableInfoList,
    maximumBuyable,
    buyProduct,
}: BuyReceiptProps) {
    let totalNumber = 0;
    let totalCost = 0;

    return (
        <div className="w-full h-full flex flex-col justify-between items-center bg-white color-text-textcolor border-[0.4vw] color-border-subbold">
            <p className="h-[15%] text-[2.4vw] flex items-center justify-center">
                구매 영수증
            </p>
            <div className="w-[90%] h-[60%] text-[1.2vw]">
                <div className="w-full flex justify-between">
                    <p className="w-[35%]">물품명</p>
                    <p className="w-[30%]">수량</p>
                    <p className="w-[35%]">가격</p>
                </div>
                <p>-------------------------------</p>
                {buyableInfoList.map((buyable) => {
                    const product = buyable.buyingInfo;
                    if (product.productQuantity !== 0) {
                        totalNumber += product.productQuantity;
                        totalCost += product.productTotalCost;
                        return (
                            <div
                                className="w-full flex justify-between my-[0.2vw]"
                                key={product.productId}
                            >
                                <p className="w-[35%]">
                                    {gameInfo.product[product.productId]}
                                </p>
                                <p className="w-[30%]">
                                    {product.productQuantity}
                                </p>
                                <p className="w-[35%]">
                                    {product.productTotalCost.toLocaleString()}
                                </p>
                            </div>
                        );
                    }
                })}
            </div>
            <div className="w-[90%] text-[1.2vw]">
                <p>-------------------------------</p>
                <div className="flex items-center justify-between">
                    <p>총 구매 가능</p>
                    <p>
                        {totalNumber} / {maximumBuyable}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <p>총 결재 금액</p>
                    <p>{totalCost.toLocaleString()}</p>
                </div>
                <div
                    className="my-[0.4vw] py-[0.4vw] border-[0.2vw] color-border-subbold cursor-pointer"
                    onClick={() => buyProduct(-1 * totalCost)}
                >
                    구매
                </div>
            </div>
        </div>
    );
}
