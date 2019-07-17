import path from 'path';
import { copyFixtureIntoTempDir } from 'jest-fixtures';

import getPackageInfo from './get-package-info';

describe('Get package info utility', () => {
  let cwd;
  let packageInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'simple-mock-packages');
    packageInfo = await getPackageInfo(['packages/*'], { rootDir: cwd });
  });

  it('returns a list of packages', async () => {
    expect(packageInfo[0]).toHaveProperty('id', 'mock-package-1');
    expect(packageInfo[1]).toHaveProperty('id', 'mock-package-2');
    expect(packageInfo[2]).toHaveProperty('id', 'mock-package-3');
  });

  it('extracts name from package.json', async () => {
    expect(packageInfo[0]).toHaveProperty('name', 'mock-package-1');
    expect(packageInfo[1]).toHaveProperty('name', 'mock-package-2');
    expect(packageInfo[2]).toHaveProperty('name', 'mock-package-3');
  });

  it('finds the path to the package dir', async () => {
    expect(packageInfo[0]).toHaveProperty(
      'pkgPath',
      path.join(process.cwd(), 'packages', 'mock-package1'),
    );
    expect(packageInfo[1]).toHaveProperty(
      'pkgPath',
      path.join(process.cwd(), 'packages', 'mock-package2'),
    );
    expect(packageInfo[2]).toHaveProperty(
      'pkgPath',
      path.join(process.cwd(), 'packages', 'mock-package3'),
    );
  });

  it('finds the path to the package README dir, and returns an empty path if the README does not exist', async () => {
    expect(packageInfo[0]).toHaveProperty(
      'readmePath',
      path.join(process.cwd(), 'packages', 'mock-package1', 'README.md'),
    );
    expect(packageInfo[1]).toHaveProperty(
      'readmePath',
      path.join(process.cwd(), 'packages', 'mock-package2', 'README.md'),
    );
    expect(packageInfo[2]).toHaveProperty('readmePath', '');
  });

  it('finds the paths of all the docs', async () => {
    const assertDocs = (pkgInfo, pkgName) => {
      const nonsense =
        pkgName === 'mock-package1'
          ? [
              {
                id: 'some-subdirectory',
                children: [
                  {
                    id: 'nesting-now-supported',
                    path: path.join(
                      process.cwd(),
                      'packages',
                      pkgName,
                      'docs',
                      'some-subdirectory/nesting-now-supported.md',
                    ),
                  },
                ],
              },
            ]
          : [];

      expect(pkgInfo).toMatchObject({
        docsPaths: [
          {
            id: 'extended-info',
            path: path.join(
              process.cwd(),
              'packages',
              pkgName,
              'docs',
              'extended-info.md',
            ),
          },
          ...nonsense,
          {
            id: 'special-usecase',
            path: path.join(
              process.cwd(),
              'packages',
              pkgName,
              'docs',
              'special-usecase.mdx',
            ),
          },
        ],
      });
    };

    assertDocs(packageInfo[0], 'mock-package1');
    assertDocs(packageInfo[1], 'mock-package2');
    assertDocs(packageInfo[2], 'mock-package3');
  });

  it('finds the paths of all files in the examples folder', async () => {
    const assertExamples = (pkgInfo, pkgName) => {
      expect(pkgInfo.examplesPaths).toEqual([
        {
          id: 'example1',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'examples',
            'example1.js',
          ),
        },
        {
          id: 'example2',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'examples',
            'example2.js',
          ),
        },
        {
          id: 'example3',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'examples',
            'example3.js',
          ),
        },
      ]);
    };

    assertExamples(packageInfo[0], 'mock-package1');
    assertExamples(packageInfo[1], 'mock-package2');
    assertExamples(packageInfo[2], 'mock-package3');
  });

  it('hides the other examples according to the showSubExamples config', async () => {
    expect(packageInfo[0].subExamplesPaths).toEqual([]);
  });

  it('returns meta for the package readme', () => {
    expect(packageInfo[0].readmeMeta).toEqual({
      keywords: ['project', 'react'],
    });
    expect(packageInfo[1].readmeMeta).toEqual({});
    expect(packageInfo[2].readmeMeta).toBeUndefined();
  });
});

describe('Test array of packages', () => {
  let cwd;
  let packageInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(__dirname, 'simple-mock-packages');
    process.chdir(cwd);
    packageInfo = await getPackageInfo(
      [
        'packages/mock-package1',
        'packages/mock-package2',
        'packages/mock-package3',
      ],
      { rootDir: cwd },
    );
  });

  it('can accept an array of paths', () => {
    expect(packageInfo[0].id).toEqual('mock-package-1');
    expect(packageInfo[1].id).toEqual('mock-package-2');
    expect(packageInfo[2].id).toEqual('mock-package-3');
  });
});

describe('Test the sub examples package', () => {
  let cwd;
  let packageInfo;

  beforeAll(async () => {
    cwd = await copyFixtureIntoTempDir(
      __dirname,
      'mock-package-with-sub-examples',
    );
    process.chdir(cwd);
    packageInfo = await getPackageInfo(['packages/mock-package1'], {
      showSubExamples: true,
      rootDir: cwd,
    });
  });

  it('finds the paths of all the sub examples in a package', async () => {
    const assertSubExamples = (pkgInfo, pkgName) => {
      expect(pkgInfo.subExamplesPaths).toEqual([
        {
          id: '/src',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'src',
            'examples.js',
          ),
        },
        {
          id: '/src/test-examples',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'src',
            'test-examples',
            'examples.js',
          ),
        },
        {
          id: '/src/view',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'src',
            'view',
            'examples.js',
          ),
        },
        {
          id: '/src/view/sub-dir',
          path: path.join(
            process.cwd(),
            'packages',
            pkgName,
            'src',
            'view',
            'sub-dir',
            'examples.js',
          ),
        },
      ]);
    };

    assertSubExamples(packageInfo[0], 'mock-package1');
  });
});

describe('hiding examples', () => {
  it('hides all examples', async () => {
    const cwd = await copyFixtureIntoTempDir(
      __dirname,
      'mock-package-with-sub-examples',
    );
    const packageInfo = await getPackageInfo(['packages/mock-package1'], {
      showExamples: false,
      rootDir: cwd,
    });

    expect(packageInfo[0].examplesPaths).toEqual([]);
  });
  it('hides subExamples when examples are disabled', async () => {
    const cwd = await copyFixtureIntoTempDir(
      __dirname,
      'mock-package-with-sub-examples',
    );
    const packageInfo = await getPackageInfo(['packages/mock-package1'], {
      showSubExamples: true,
      showExamples: false,
      rootDir: cwd,
    });

    expect(packageInfo[0].subExamplesPaths).toEqual([]);
  });
});
