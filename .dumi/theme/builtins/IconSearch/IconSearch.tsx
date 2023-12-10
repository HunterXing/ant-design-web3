import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Affix, Empty, Input, Segmented, type SegmentedProps } from 'antd';
import AntdIcon from '@ant-design/icons';
import * as AntdWeb3Icons from '@ant-design/web3-icons';
import { createStyles, useTheme } from 'antd-style';
import { useIntl } from 'dumi';
import debounce from 'lodash/debounce';

import Category from './Category';
import { categories, CategoriesKeys } from './fields';
import { CircleFilledIcon, ColorfulIcon, FilledIcon } from './themeIcons';

export enum ThemeType {
  Filled = 'Filled',
  CircleFilled = 'CircleFilled',
  Colorful = 'Colorful',
}

const allIcons: Record<string, any> = AntdWeb3Icons;

const useStyle = createStyles(({ css }) => ({
  iconSearchAffix: css`
    display: flex;
    transition: all 0.3s;
    justify-content: space-between;
  `,
}));

const options = (
  formatMessage: (values: Record<string, string>) => React.ReactNode,
): SegmentedProps['options'] => [
  {
    value: ThemeType.Colorful,
    icon: <AntdIcon component={ColorfulIcon} />,
    label: formatMessage({ id: 'app.docs.components.icon.colorful' }),
  },
  {
    value: ThemeType.Filled,
    icon: <AntdIcon component={FilledIcon} />,
    label: formatMessage({ id: 'app.docs.components.icon.filled' }),
  },
  {
    value: ThemeType.CircleFilled,
    icon: <AntdIcon component={CircleFilledIcon} />,
    label: formatMessage({ id: 'app.docs.components.icon.circle-filled' }),
  },
];

interface IconSearchState {
  theme: ThemeType;
  searchKey: string;
}

const IconSearch: React.FC = () => {
  const intl = useIntl();
  const token = useTheme();
  const { styles } = useStyle();
  const [displayState, setDisplayState] = useState<IconSearchState>({
    searchKey: '',
    theme: ThemeType.Colorful,
  });

  const newIconNames: string[] = [];

  const handleSearchIcon = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayState((prevState) => ({ ...prevState, searchKey: e.target.value }));
  }, 300);

  const handleChangeTheme = useCallback((theme: any) => {
    setDisplayState((prevState) => ({ ...prevState, theme }));
  }, []);

  const renderCategories = useMemo<React.ReactNode | React.ReactNode[]>(() => {
    const { searchKey = '', theme } = displayState;

    const categoriesResult = Object.keys(categories)
      .map((key) => {
        let iconList = categories[key as CategoriesKeys];
        if (searchKey) {
          const matchKey = searchKey
            .replace(new RegExp(`^<([a-zA-Z]*)\\s/>$`, 'gi'), (_, name) => name)
            .replace(/(Colorful|Filled|CircleFilled)$/gi, '')
            .toLowerCase();
          iconList = iconList.filter((iconName) => iconName.toLowerCase().includes(matchKey));
        }

        return {
          category: key,
          icons: iconList
            .map((iconName) => iconName + theme)
            .filter((iconName) => allIcons[iconName]),
        };
      })
      .filter(({ icons }) => !!icons.length)
      .map(({ category, icons }) => (
        <Category
          key={category}
          title={category as CategoriesKeys}
          theme={theme}
          icons={icons}
          newIcons={newIconNames}
        />
      ));

    return categoriesResult.length ? categoriesResult : <Empty style={{ margin: '2em 0' }} />;
  }, [displayState.searchKey, displayState.theme]);

  const [searchBarAffixed, setSearchBarAffixed] = useState<boolean | undefined>(false);

  const { borderRadius, colorBgContainer, anchorTop } = token;

  const affixedStyle: CSSProperties = {
    boxShadow: 'rgba(50, 50, 93, 0.25) 0 6px 12px -2px, rgba(0, 0, 0, 0.3) 0 3px 7px -3px',
    padding: 8,
    margin: -8,
    borderRadius,
    backgroundColor: colorBgContainer,
  };

  return (
    <div className="markdown">
      <Affix offsetTop={anchorTop} onChange={setSearchBarAffixed}>
        <div className={styles.iconSearchAffix} style={searchBarAffixed ? affixedStyle : {}}>
          <Segmented
            size="large"
            value={displayState.theme}
            options={options(intl.formatMessage)}
            onChange={handleChangeTheme}
          />
          <Input.Search
            placeholder={intl.formatMessage({ id: 'app.docs.components.icon.search.placeholder' })}
            style={{ flex: 1, marginInlineStart: 16 }}
            allowClear
            autoFocus
            size="large"
            onChange={handleSearchIcon}
          />
        </div>
      </Affix>
      {renderCategories}
    </div>
  );
};

export default IconSearch;