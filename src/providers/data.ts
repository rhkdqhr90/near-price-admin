import { authHeaderBeforeRequestHook } from "@refinedev/rest";
import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import type { DataProvider } from "@refinedev/core";
import { API_URL, TOKEN_KEY } from "./constants";

const { dataProvider: baseProvider, kyInstance } =
  createSimpleRestDataProvider({
    apiURL: API_URL,
    kyOptions: {
      hooks: {
        beforeRequest: [
          authHeaderBeforeRequestHook({ ACCESS_TOKEN_KEY: TOKEN_KEY }),
        ],
      },
    },
  });

// X-Total-Count 헤더가 없을 때 응답 배열 길이를 total로 사용
export const dataProvider: DataProvider = {
  ...baseProvider,
  getList: async (params) => {
    const result = await baseProvider.getList(params);
    if (result.total === 0 && result.data.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...result, total: result.data.length } as any;
    }
    return result;
  },
};

export { kyInstance };
