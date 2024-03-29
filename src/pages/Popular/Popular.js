import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux'
import ListPageComponent from "../../components/ListPageComponent";
import MetaTags from "react-meta-tags";
import MainLayout from "../../layouts/MainLayout";
import Section from "../../components/Section";
import Breadcrumbs from "../../components/Breadcrumbs";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import Title from "../../components/Title";
import LoaderComponent from "../../components/LoaderComponent";
import styles from "../Destinations/Destinations.module.css";
import Destination from "../Destinations/Destination";
import TextSection from "../Tours/TextSection";
import {getPopularDestinations} from "../../redux/actions/toursActions";
import SearchSection from "../../components/SearchSection";
import {useHistory} from "react-router-dom";
import {parseQs} from "../../functions";
import ReactPaginate from "react-paginate";

const Popular = ({language, location, popular_destinations, getPopularDestinations}) => {

  const history = useHistory()
  const {pathname} = location
  const [currentSearchParams, setCurrentSearchParams] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [allTours, setAllTours] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  useEffect(() => {
    if (popular_destinations) {
      setAllTours(popular_destinations)
    }
  }, [popular_destinations])
  useEffect(() => {
    let querystring
    if (location?.search) {
      if (location?.search[0] === '?') {
        querystring = location?.search?.slice(1)
      } else {
        querystring = location?.search
      }
      getPopularDestinations(querystring)
      let search = parseQs(querystring).filter(item => item.type !== 'page').map(item => {
        return `${item.type}=${item.data.join(',')}`
      }).join('&')
      if (search !== currentSearchParams) {
        setCurrentSearchParams(search)
      }

      if (parseQs(querystring).some(item => item.type === 'page')) {
        parseQs(querystring).map(item => {
          if (item.type === 'page') {
            setCurrentPage(Number(item.data - 1))
          }
        })
      }

    } else {
      getPopularDestinations()
    }
  }, [location])
  useEffect(() => {
    if (allTours?.page_size) {
      setPageCount(Math.ceil(allTours?.count / allTours?.page_size))
    }
  }, [allTours])
  const handlePaginate = n => {
    history.push(`${pathname}?${currentSearchParams}${currentSearchParams ? '&' : ''}page=${n}`)
  }


  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loading && popular_destinations?.length > 0) {
      setLoading(false)
    }
  }, [popular_destinations, loading])

  // useEffect(() => {
  //   getPopularDestinations()
  // }, [])

  return (
    <>
      <MetaTags>
        <title>Traveler Market - Маркетплейс авторских туров</title>
        <meta name='description' content=''/>
      </MetaTags>
      <MainLayout page={pathname}>
        <SearchSection
          background={'#f6f7f9'}
          padding={'40px 0'}
          search_bar_border={false}
        />

        <Section padding={'0px'}>
          <Breadcrumbs>
            <Breadcrumb
              link={`/`}
            >
              Главная
            </Breadcrumb>
            <Breadcrumb link={`/napravleniia`}>
              Направления
            </Breadcrumb>
            <Breadcrumb>
              Популярные направления
            </Breadcrumb>
          </Breadcrumbs>
        </Section>

        <Section padding={'0'}>
          <Title title={'Направления'} border_color={'blue'}
                 sub_title={`Направлений: ${popular_destinations?.results?.length}`}/>
          {loading && (
            <LoaderComponent/>
          )}
          {!loading && (
            <>
              <div className={styles.destinations_wrapper}>
                {popular_destinations?.results?.map((destination, index) => <Destination key={index}
                                                                                         destination={destination}/>)}
              </div>
              {pageCount > 1 && (<div className={'pagination'}>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel=">"
                  onPageChange={e => {
                    handlePaginate(e.selected + 1)
                  }}
                  // onPageChange={e => {
                  //   getToursByFilters(`ident=${ident}&page_slug=${page}&item_slug=${item}&page=${e.selected + 1}`)
                  // }}
                  pageRangeDisplayed={5}
                  pageCount={pageCount}
                  previousLabel="<"
                  renderOnZeroPageCount={null}
                  forcePage={currentPage}
                  // hrefAllControls={true}
                  hrefBuilder={(page, pageCount, selected) =>
                    page >= 1 && page <= pageCount ? `${pathname}?${currentSearchParams}${currentSearchParams ? '&' : ''}page=${page}` : '#'
                  }
                />
              </div>)}
            </>
          )}
        </Section>

        <SearchSection
          background={'#2AA2D6'}
          padding={'40px 0'}
          title={'Подобрать тур'}
          sub_title={'Мы подберем только лучшее'}
          title_color={'white'}
          title_border_color={'white'}
        />

        <Section padding={'40px 0'}>
          <Title title={'Traveler.market'} sub_title={'Немного о нас и наших услугах'} border_color={'orange'}/>
          <TextSection/>
        </Section>

      </MainLayout>
    </>
  )
}

const mapStateToProps = state => ({
  language: state.languages.language,
  popular_destinations: state.tours.popular_destinations,
})

const mapDispatchToProps = {
  getPopularDestinations,
}

export default connect(mapStateToProps, mapDispatchToProps)(Popular)