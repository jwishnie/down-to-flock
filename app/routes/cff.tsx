// import splash from '~/assets/tavie-and-me.jpg'
import splash from '~/assets/tavie-chick.jpg'
import cff from '~/assets/cff.png'
import strides from '~/assets/great-strides.png'

export default function CFF() {
  return (
    <main className="container mx-auto py-8">
      <div className="text-sm  flex flex-col items-center justify-center px-6 gap-5 text-center">
        <div className="header ">
          Enjoying the Chickens?
          <br />
          <a
            href="https://www.cff.org/donate"
            target="_blank"
            rel="noreferrer noopener"
          >
            Donate to a Cause!
          </a>
        </div>

        <a
          className="flex items-center justify-center gap-2"
          href="https://give.cff.org/annualfund/clickensforacure"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img alt="Cystic Fibrosis Foundation" src={cff} className="w-1/4" />
          <img alt="Great Strides" src={strides} className="w-1/4" />
        </a>
        <img alt="Tavie is a cute chicken" src={splash} className="w-lg" />
        <div className="text-justify">
          <span>
            Hi, I'm Jeff. I built this corner of Chickentown. That's my kid
            Tavie, a force of nature, which is good, because Tavie has{' '}
          </span>
          <span>
            <a
              href="https://www.cff.org/intro-cf/about-cystic-fibrosis"
              target="_blank"
              rel="noreferrer noopener"
            >
              Cystic Fibrosis
            </a>{' '}
            (CF)
          </span>
          , and having CF can be tough.
        </div>
        <div className="text-justify">
          Good thing there is a foundation that funds research that led to a{' '}
          <a
            href="https://www.theatlantic.com/magazine/archive/2024/04/cystic-fibrosis-trikafta-breakthrough-treatment/677471/"
            target="_blank"
            rel="noreferrer noopener"
          >
            miracle treatment
          </a>{' '}
          for ~90% of people with CF, including Tavie.
        </div>
        <div className="text-justify  ">
          But we need more research (research = money) to find treatments for
          everyone, and a cure for all. So I'm interrupting your chickens to ask
          you to pitch in (
          <a
            href="https://give.cff.org/annualfund/clickensforacure"
            target="_blank"
            rel="noreferrer noopener"
          >
            that means give money
          </a>
          ).
        </div>
        <div className="text-justify ">
          Thanks for reading. <a href="/">Back to the chickens!</a>
        </div>
      </div>
    </main>
  )
}

